/**
 * @file 小程序
 * @module lib.xiaochengxu
 * @author r2space@gmail.com
 * @version 1.0.0
 */

'use strict';

var request = light.util.request
  , config  = light.framework.config
  , util    = light.lang.util
  , helper  = require('../helper');

/**
 * 使用登录凭证 code 获取 session_key 和 openid
 * 参考 : https://mp.weixin.qq.com/debug/wxadoc/dev/api/api-login.html
 * @param params
 * @param callback
 * @returns {boolean}
 */
exports.jscode2session = function (params, callback) {

  var basic = 'https://api.weixin.qq.com/sns/jscode2session'
    , appid = (params.appid || config.wechat.xcx.AppID)
    , secret = (params.secret || config.wechat.xcx.AppSecret)
    , code = params.code
    ;

  var url = util.format('%s?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code', basic, appid, secret, code);
  request(helper.get(url), function (err, response, body) {
    if (err || response.statusCode != 200) {
      return callback(err || response.statusCode);
    }

    callback(err, JSON.parse(body));
  });

};

/**
 * 生成小程序页面二维码
 * @param params
 * @param callback
 */
exports.qrcode = function (params, callback) {

  exports.accessToken(function (err, token) {
    if (err) {
      return callback(err);
    }

    var url = 'https://api.weixin.qq.com/cgi-bin/wxaapp/createwxaqrcode?access_token=' + token.access_token
      , data = {path: params.path, width: params.width};

    request(helper.post(url, data), function (err, response, body) {
      if (err || response.statusCode != 200) {
        return callback(err || response.statusCode);
      }

      callback(err, JSON.parse(body));
    });
  });

};

/**
 * 访问凭证缓存
 * @type {{access_token: undefined, expires_in: undefined}}
 */
var token = {
  access_token: undefined,
  expires_in: new Date(2000, 1, 1)
};

/**
 * 获取access_token
 * 和公众号的access_token获取方式相同，获取小程序二维码等超做需要使用该token
 * @param params
 * @param callback
 */
exports.accessToken = function (params, callback) {

  if (typeof params == 'function') {
    callback = params;
    params = {};
  }

  // 如果凭证没有超时，则继续使用
  if (new Date().getTime() < token.expires_in) {
    return callback(undefined, token);
  }

  var basic = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential'
    , appid = (params.appid || config.wechat.xcx.AppID)
    , secret = (params.secret || config.wechat.xcx.AppSecret);

  var url = util.format('%s&appid=%s&secret=%s', basic, appid, secret);
  request(helper.get(url),
    function (err, response, body) {
      if (err || response.statusCode != 200) {
        return callback(err || response.statusCode);
      }

      token = JSON.parse(body);
      token.expires_in = new Date().getTime() + (token.expires_in - 5) * 1000; // 提前5秒

      callback(err, token);
    });
};
