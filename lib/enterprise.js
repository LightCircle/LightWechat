/**
 * @file 微信企业号 回调模式封装
 *  企业号与后台连接时(启用回调模式时)需要验证, 这里提供了verify方法帮助应用实现验证
 *  需要设定在配置画面设定以下3个值
 *   Token          : App的Token
 *   EncodingAESKey : App的AESKey
 *   CorpID         : 企业号的CorpID
 *
 *  企业号与后台连接时的验证(GET方法), 与客户端产生的事件(POST方法)使用同一个
 *   后台接受处理的函数里, 需要使用Method来识别是哪一类请求
 *
 * @author r2space@gmail.com
 * @module lib.enterprise
 * @version 1.0.0
 */


"use strict";

var url         = require("url")
  , xml2js      = light.util.xml2js
  , config      = light.framework.config
  , helper      = light.framework.helper
  , log         = light.framework.log
  , Crypto      = require("./crypto")
  ;

var instance = undefined;

function crypto() {
  if (instance) {
    return instance;
  }

  instance = new Crypto(config.wechat.Token, config.wechat.EncodingAESKey, config.wechat.CorpID);
  return instance;
}

/**
 * @desc GET方法请求
 * 开启回调模式，验证企业服务器配置时使用
 * 在配置窗口指定的Token及EncodingAESKey需要写到配置文件中
 * @param {Object} handler
 */
exports.verify = function (handler) {

  var signature = handler.params.msg_signature // 微信加密签名
    , timestamp = handler.params.timestamp     // 时间戳
    , nonce = handler.params.nonce             // 随机数
    , echostr = handler.params.echostr;        // 加密的随机字符串

  // 对请求进行校验，验证是否是来自微信服务器
  var compute = crypto().getSignature(timestamp, nonce, echostr);
  if (signature != compute) {
    log.error("Invalid signature");
    return sendError("Invalid signature", handler.res);
  }

  // 返回解密后的消息本体
  send(crypto().decrypt(echostr).message, handler.res);
};

/**
 * @desc 接受微信企业号产生的事件
 * @param {Object} handler 请求对象
 * @param callback
 *  第一参数为, 微信请求参数
 *  第二参数为, 发送消息的方法, 如果应用需要返回给微信消息, 可以使用改方法
 */
exports.listen = function (handler, callback) {

  var signature = handler.params.msg_signature // 微信加密签名
    , timestamp = handler.params.timestamp     // 时间戳
    , nonce = handler.params.nonce;            // 随机数

  console.log(handler.params);

  // 解析企业号发送过来的消息体
  xml2js.parseString(handler.params.xml, {trim: true}, function (err, result) {
    if (err) {
      log.error("BadMessage");
      return sendError("BadMessage" + err.name, handler.res);
    }

    var xml = formatMessage(result.xml);

    // 验证signature
    var encryptMessage = xml.Encrypt;
    if (signature !== crypto().getSignature(timestamp, nonce, encryptMessage)) {
      log.error("Invalid signature");
      return sendError("Invalid signature", handler.res);
    }

    // 解密消息本体
    var decrypted = crypto().decrypt(encryptMessage);
    if (decrypted.message == "") {
      log.error("BadMessage");
      return sendError("BadMessage", handler.res);
    }

    // 解析消息内容
    xml2js.parseString(decrypted.message, {trim: true}, function (err, result) {
      if (err) {
        log.error("BadMessage");
        return sendError("BadMessage" + err.name, handler.res);
      }

      var message = formatMessage(result.xml);
      if (callback) {
        return callback(message, function (content) {
          formatReplyMessage(handler.res, content);
        });
      }

      // 忽略客户端的事件, 返回空
      send(undefined, handler.res);
    });
  });
};

/**
 * @desc 将xml2js解析出来的对象转换成直接可访问的对象
 * @param {Object} result 消息内容对象
 * @ignore
 */
function formatMessage(result) {
  var message = {};
  if (typeof result === "object") {
    for (var key in result) {
      if (result[key].length === 1) {
        var val = result[key][0];
        if (typeof val === "object") {
          message[key] = formatMessage(val);
        } else {
          message[key] = (val || "").trim();
        }
      } else {
        message = result[key].map(formatMessage);
      }
    }
  }
  return message;
}

/**
 * @desc 发送错误信息
 * @param {String} message 错误信息
 * @param {Object} res 响应对象
 * @returns {boolean}
 * @ignore
 */
function sendError(message, res) {
  res.writeHead(401);
  res.end(message);
  return false;
}

/**
 * @desc 发送正确的回复信息
 * @param {String} message 正确信息
 * @param {Object} res 响应对象
 * @ignore
 */
function send(message, res) {
  res.writeHead(200, {"Content-Type": "text/plain"});
  res.end(message);
}

/**
 * @desc 从请求(req)中解析出XML字符串
 * @param {Object} res 响应对象
 * @param callback
 * @ignore
 */
function loadXml(req, callback) {
  var buffers = [];

  req.on("data", function (trunk) {
    buffers.push(trunk);
  });

  req.on("end", function () {
    callback(null, Buffer.concat(buffers).toString("utf-8"));
  });

  req.once("error", callback);
}

/**
 * @desc 格式化
 * @param {Object} res 响应对象
 * @param {String} content 回复内容
 * @returns {*}
 * @ignore
 */
function formatReplyMessage(res, content) {

  // 响应空字符串，用于响应慢的情况，避免微信重试
  if (!content) {
    return send(undefined, res);
  }

  var xml = helper.ejsParser(__dirname + "/enterprise_template.ejs", content), wrap = {};
  wrap.encrypt = crypto().encrypt(xml);
  wrap.nonce = parseInt((Math.random() * 100000000000), 10);
  wrap.timestamp = new Date().getTime();
  wrap.signature = crypto().getSignature(wrap.timestamp, wrap.nonce, wrap.encrypt);

  var xmlTemplate = "" +
    "<xml>" +
    "<Encrypt><![CDATA[{{-encrypt}}]]></Encrypt>" +
    "<MsgSignature><![CDATA[{{-signature}}]]></MsgSignature>" +
    "<TimeStamp>{{-timestamp}}</TimeStamp>" +
    "<Nonce><![CDATA[{{-nonce}}]]></Nonce>" +
    "</xml>";

  send(helper.ejsFormat(xmlTemplate, wrap), res);
}
