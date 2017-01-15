/**
 * @file 微信企业号 主动调用模式封装
 *  获取访问Token, 需要使用CorpID和Secret
 *  Secret 是管理组凭证密钥, 微信企业号 -> 设置 -> 权限管理 -> 选择某一组 即可查看Secret号
 *
 *  TODO: 使用 urllib 发送的请求, 要换成 request
 *  TODO: 和mpapi一样, 使用 "wechat-enterprise-api"@"0.3.0" 包
 *
 * @author r2space@gmail.com
 * @module light.bridge.wechat.api
 * @version 1.0.0
 */

"use strict";

var fs          = require("fs")
  , path        = require("path")
  , util        = require("util")
  , request     = light.util.request
  , config      = light.framework.config
  , sign        = require("./sign")
  , constant    = require("./constant");

var accessToken   = undefined
  , jsapiTicket   = undefined
  , expiredToken  = 0
  , expiredTicket = 0;

/**
 * @desc 获取组一览
 * @param callback
 */
exports.departments = function (callback) {

  fetchAccessToken({}, function (err, token) {
    if (err) {
      return callback(err);
    }

    var url = constant.WECHAT_URL + "/department/list?access_token=" + token;
    request(url, function (err, response, body) {
      if (err || response.statusCode != 200) {
        return callback(err || response.statusCode);
      }

      callback(err, JSON.parse(body));
    });
  });
};

/**
 * @desc 发送新闻消息
 * @param {Object} meta
 * @param  meta.touser  UserID1|UserID2|UserID3
 * @param  meta.toparty   PartyID1 | PartyID2
 * @param  meta.totag   TagID1 | TagID2
 * @param  meta.msgtype
 * @param  meta.agentid
 * @param  meta.news
 * @param  meta.news.articles
 * @param  meta.news.articles[].title Title
 * @param  meta.news.articles[].description Description
 * @param  meta.news.articles[].url URL
 * @param  meta.news.articles[].picurl PIC_URL
 * @param callback
 */
exports.sendNews = function (meta, callback) {

  fetchAccessToken(meta, function (err, token) {
    if (err) {
      return callback(err);
    }

    meta = meta || {};
    meta.msgtype = "news";
    meta.agentid = meta.agentid || config.wechat.agentId;
    meta.text = {content: message};

    var url = constant.WECHAT_URL + "/message/send?access_token=" + token;
    urllib.request(url, body(meta), function (err, result) {
      callback(err, result);
    });
  });
};

/**
 * @desc 发送图片消息
 * @param meta
 * @param touser
 * @param toparty
 * @param totag
 * @param agentid
 * @param safe
 * @param {Object} image 图片对象
 * @param callback
 */
exports.sendImage = function (meta, image, callback) {

  fetchAccessToken(meta, function (err, token) {
    if (err) {
      return callback(err);
    }

    uploadFile(token, image, "file", function (err, info) {
      if (err) {
        return callback(err);
      }

      meta = meta || {};
      meta.msgtype = "image";
      meta.agentid = meta.agentid || config.wechat.agentId;
      meta.image = {media_id: info.media_id};

      var url = constant.WECHAT_URL + "/message/send?access_token=" + token;
      urllib.request(url, body(meta), function (err, result) {
        callback(err, result);
      });
    });
  });
};

/**
 * @desc 发送文本消息
 *  参数说明 : http://qydev.weixin.qq.com/wiki/index.php?title=消息类型及数据格式
 * @param meta
 * @param meta.touser
 * @param meta.toparty
 * @param meta.totag
 * @param meta.msgtype
 * @param meta.agentid
 * @param meta.text.content 必须 需要发送的信息
 * @param meta.safe
 * @param callback
 */
exports.sendText = function (meta, callback) {

  fetchAccessToken(meta, function (err, token) {
    if (err) {
      return callback(err);
    }

    meta = meta || {};
    meta.touser = meta.touser || "@all";
    meta.msgtype = meta.msgtype || "text";
    meta.agentid = meta.agentid || config.wechat.agentid;
    meta.safe = 0;

    request({
      url: constant.WECHAT_URL + "/message/send?access_token=" + token,
      proxy: process.env.DEV ? undefined : config.app.proxy,
      method: "POST",
      json: meta,
      headers: {
        "Content-Type": "application/json"
      }
    }, function (err, response, body) {
      if (err || response.statusCode != 200) {
        return callback(err || response.statusCode);
      }

      callback(err, body);
    });
  });
};

/**
 * @desc 获取post的消息格式
 * @param data
 * @returns Object
 */
function body(data) {
  return {
    dataType: "json",
    type: "POST",
    data: data,
    headers: {
      "Content-Type": "application/json"
    }
  };
}

/**
 * @desc 上传文件
 * @param token
 * @param filepath
 * @param type
 * @param callback
 * @ignore
 */
function uploadFile(token, filepath, type, callback) {

  var stat = fs.statSync(filepath)
    , form = formstream();

  form.file("media", filepath, path.basename(filepath), stat.size);
  var options = {
    dataType: "json",
    type: "POST",
    timeout: 60000, // 60秒超时
    headers: form.headers(),
    stream: form
  };

  var url = constant.WECHAT_URL + "/media/upload?access_token=" + token + "&type=" + type;
  urllib.request(url, options, function (err, body) {
    callback(err, body);
  });
}

/**
 * @desc 获取OAuth2验证用URL
 * @param redirect 验证通过后，重定向的页面URL
 * @param customParameter 重定向是传递的自定义参数 a-zA-Z0-9
 * @returns String OAuth用URL
 */
exports.oauthUrl = function (redirect, customParameter) {

  var url = "https://open.weixin.qq.com/connect/oauth2/authorize"
    , format = url + "?appid=%s&redirect_uri=%s&response_type=code&scope=snsapi_base&state=%s#wechat_redirect";

  return util.format(format, config.wechat.CorpID, redirect, scope, customParameter);
};

/**
 * @desc 用CorpID和Secret来换取AccessToken
 * AccessToken有效期为7200秒
 * corpID 企业号的标识，在企业号管理页面获取
 * secret 管理组凭证密钥，在企业号管理页面获取
 * @param option CorpID & Secret
 * @param callback 返回access_token
 * @ignore
 */
function fetchAccessToken(option, callback) {

  // 未超时，则继续复用
  if (new Date().getTime() < expiredToken) {
    return callback(undefined, accessToken);
  }

  var corpID = option.corpid || config.wechat.CorpID
    , secret = option.secret || config.wechat.Secret;

  // 获取token
  var url = constant.WECHAT_URL + "/gettoken?corpid=" + corpID + "&corpsecret=" + secret;
  request({
    url: url,
    method: "GET",
    proxy: process.env.DEV ? undefined : config.app.proxy
  }, function (err, response, body) {
    if (err || response.statusCode != 200) {
      return callback(err || response.statusCode);
    }

    var data = JSON.parse(body);
    accessToken = data.access_token;
    expiredToken = new Date().getTime() + (data.expires_in - 5) * 1000; // 提前5秒
    callback(err, accessToken);
  });
}

/**
 * @desc jsapi_ticket的有效期为7200秒，通过access_token来获取
 * @param callback 返回jsapi_ticket
 * @ignore
 */
function fetchJsapiTicket(callback) {

  // 未超时，则继续复用
  if (new Date().getTime() < expiredTicket) {
    return callback(undefined, jsapiTicket);
  }

  // 获取token
  var url = constant.WECHAT_URL + "/get_jsapi_ticket?access_token=" + accessToken;
  request(url, function (err, response, body) {
    if (err || response.statusCode != 200) {
      return callback(err || response.statusCode);
    }

    var data = JSON.parse(body);
    jsapiTicket = data.ticket;
    expiredTicket = new Date().getTime() + (data.expires_in - 5) * 1000; // 提前5秒
    callback(err, jsapiTicket);
  });
}

/**
 * @desc 获取JSAPI的config信息
 * @param url 网页的URL
 * @param callback 回调，返回config信息
 */
exports.getJsConfig = function (url, callback) {

  fetchAccessToken({}, function (err, token) {
    fetchJsapiTicket(function (err, ticket) {
      callback(err, sign(jsapiTicket, url));
    });
  });
};
