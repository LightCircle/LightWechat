/**
 * @file 微信开发支持
 * 名称
 *  mp: 公众平台 回复功能
 *  mp api: 公众平台 主动调用功能
 *  open: 开放平台
 *  enterprise: 企业号
 *  enterprise api: 企业号 主动调用功能
 *
 * 用于验证服务器地址的有效性的URL分别为
 *  http://wx.alphabets.cn/wechat/mp
 *  http://wx.alphabets.cn/wechat/open
 *  http://wx.alphabets.cn/wechat/enterprise
 *
 * @author r2space@gmail.com
 * @module light.lib.mp
 * @version 1.0.0
 */


"use strict";

var xml2js      = light.util.xml2js
  , ejs         = light.util.ejs
  , config      = light.framework.config.wechat
  , helper      = light.framework.helper
  , log         = light.framework.log
  , Crypto      = require("./crypto")
  ;

var instance = undefined;

function crypto() {
  if (instance) {
    return instance;
  }

  instance = new Crypto(config.mp.Token, config.mp.EncodingAESKey, config.mp.AppID);
  return instance;
}


/**
 * @desc GET方法请求
 *  开启回调模式，公众号服务器配置时使用
 *  在配置窗口指定的Token及EncodingAESKey需要写到配置文件中
 * @param {Object} handler
 */
exports.verify = function (handler) {

  var signature = handler.params.signature     // 微信加密签名
    , timestamp = handler.params.timestamp     // 时间戳
    , nonce     = handler.params.nonce         // 随机数
    , echostr   = handler.params.echostr;      // 加密的随机字符串

  var sha1 = crypto().createHash("sha1");
  sha1.update([config.mp.Token, timestamp, nonce].sort().join(""));

  if (sha1.digest("hex") !== signature) {
    log.error("Invalid signature");
    return sendError("Invalid signature", handler.res);
  }

  // 返回解密后的消息本体
  send(echostr, handler.res);
};

/**
 * @desc 接受微信公众号产生的事件
 * @param {Object} handler 请求对象
 * @param callback
 *  第一参数为, 微信请求参数
 *  第二参数为, 发送消息的方法, 如果应用需要返回给用户消息, 可以使用该方法
 *    响应用参数 http://qydev.weixin.qq.com/wiki/index.php?title=被动响应消息
 */
exports.listen = function (handler, callback) {

  var signature = handler.params.msg_signature // 微信加密签名
    , timestamp = handler.params.timestamp     // 时间戳
    , nonce = handler.params.nonce;            // 随机数

  // 验证signature
  var encryptMessage = handler.params.xml.encrypt;
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
 * @desc 格式化
 * @param {Object} res 响应对象
 * @param {Object} content 回复内容
 * @returns {*}
 * @ignore
 */
function formatReplyMessage(res, content) {

  // 响应空字符串，用于响应慢的情况，避免微信重试
  if (!content) {
    return send(undefined, res);
  }

  // content.fromUsername
  // content.toUsername
  content.createTime = new Date().getTime();
  content.msgType = content.msgType || "text";
  content.content = content.content || "";

  var xml = helper.ejsParser(__dirname + "/mp_template.ejs", content), wrap = {};
  wrap.encrypt = crypto().encrypt(xml);
  wrap.nonce = parseInt((Math.random() * 100000000000), 10);
  wrap.timestamp = new Date().getTime();
  wrap.signature = crypto().getSignature(wrap.timestamp, wrap.nonce, wrap.encrypt);

  var xmlTemplate = "" +
    "<xml>" +
    "<Encrypt><![CDATA[<%-encrypt%>]]></Encrypt>" +
    "<MsgSignature><![CDATA[<%-signature%>]]></MsgSignature>" +
    "<TimeStamp><%-timestamp%></TimeStamp>" +
    "<Nonce><![CDATA[<%-nonce%>]]></Nonce>" +
    "</xml>";

  send(ejs.render(xmlTemplate, wrap), res);
}
