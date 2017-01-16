/**
 * @file 小程序
 * @module lib.xiaochengxu
 * @author r2space@gmail.com
 * @version 1.0.0
 */

'use strict';

var request = light.util.request
  , config  = light.framework.config
  , util    = light.lang.util;

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
  request({
    url: url, method: "GET", proxy: process.env.DEV ? undefined : config.app.proxy
  }, function (err, response, body) {

    if (err || response.statusCode != 200) {
      return callback(err || response.statusCode);
    }

    callback(err, JSON.parse(body));
  });

};
