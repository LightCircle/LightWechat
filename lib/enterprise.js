/**
 * @file 微信企业号 回调模式封装
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

  var conf = config.wechat;
  instance = new Crypto(conf.Token, conf.EncodingAESKey, conf.CorpID);

  return instance;
}

/**
 * @desc GET方法请求
 * 开启回调模式，验证企业服务器配置时使用
 * 在配置窗口指定的Token及EncodingAESKey需要写到配置文件中
 * @param {Object} req 请求对象
 * @param {Object} res 响应对象
 * @returns {*}
 */
exports.verify = function(req, res) {

  // 获取由微信服务器发起的验证请求的参数
  var query = url.parse(req.url, true).query;

  var signature = query.msg_signature // 微信加密签名
    , timestamp = query.timestamp     // 时间戳
    , nonce = query.nonce             // 随机数
    , echostr = query.echostr;        // 加密的随机字符串

  // 对请求进行校验，验证是否是来自微信服务器
  var compute = crypto().getSignature(timestamp, nonce, echostr);
  if (signature != compute) {
    log.error("Invalid signature");
    return sendError("Invalid signature", res);
  }

  // 返回解密后的消息本体
  send(crypto().decrypt(echostr).message, res);
};

/**
 * @desc 接受微信企业号产生的事件，用户发送的消息
 * @param {Object} req 请求对象
 * @param {Object} res 响应对象
 * @param callback
 *   第一参数是从微信收到的消息本体
 *   第二个参数是需要返回给微信的消息本体
 * @param callbackParams.fromUsername
 * @param callbackParams.toUsername
 * @param callbackParams.createTime
 * @param callbackParams.msgType
 * @param callbackParams.content
 * @param callbackParams.content[].title
 * @param callbackParams.content[].description
 * @param callbackParams.content[].picUrl
 * @param callbackParams.content[].url
 */
exports.reply = function(req, res, callback) {

  var signature = req.query.msg_signature // 微信加密签名
    , timestamp = req.query.timestamp     // 时间戳
    , nonce = req.query.nonce;            // 随机数

  log.debug(req.url);
  loadXml(req, function(err, xml) {

    // 解析企业号发送过来的消息体
    xml2js.parseString(xml, {trim: true}, function (err, result) {
      if (err) {
        log.error("BadMessage");
        return sendError("BadMessage" + err.name, res);
      }

      var xml = formatMessage(result.xml);

      // 验证signature
      var encryptMessage = xml.Encrypt;
      if (signature !== crypto().getSignature(timestamp, nonce, encryptMessage)) {
        log.error("Invalid signature");
        return sendError("Invalid signature", res);
      }

      // 解密消息本体
      var decrypted = crypto().decrypt(encryptMessage);
      if (decrypted.message == "") {
        log.error("BadMessage");
        return sendError("BadMessage", res);
      }

      // 解析消息内容
      xml2js.parseString(decrypted.message, {trim: true}, function (err, result) {
        if (err) {
          log.error("BadMessage");
          return sendError("BadMessage" + err.name, res);
        }

        var message = formatMessage(result.xml);
        if (callback) {
          callback(message, function(content) {
            formatReplyMessage(res, content);
          });
        } else {
          send(undefined, res);
        }
      });

    });
  });

};

/**
 * @todo 异步回复，当无法在指定的时间5秒内返回结果时，可以使用一部方式
 */
exports.replyAsync = function() {
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
