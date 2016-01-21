/**
 * @file 微信企业号 主动调用模式封装
 *  依赖 https://github.com/node-webot/wechat-api
 *  为了能在发送网络请求时使用代理, 所以request代替了原有的urllib方法
 * @author r2space@gmail.com
 * @module light.lib.mp_api
 * @version 1.0.0
 */

"use strict";

var request = light.util.request
  , config  = light.framework.config.wechat
  , extend  = light.lang.util._extend
  , wapi    = require("wechat-api")
  ;


/**
 * API 构造函数
 * @param appid
 * @param secret
 * @returns {API|exports|module.exports}
 * @constructor
 */
var MPAPI = function api(appid, secret) {

  var api = new wapi(appid || config.mp.appid, secret || config.mp.secret);

  // 改写api的请求方法(主要目的是为了使用代理)
  api.request = function (url, opts, callback) {

    // 保留 wechat-api 原有的参数整合式样
    var options = {};
    extend(options, api.defaults);

    if (typeof opts === 'function') {
      callback = opts;
      opts = {};
    }

    for (var key in opts) {
      if (key !== "headers") {
        options[key] = opts[key];
      } else {
        if (opts.headers) {
          options.headers = options.headers || {};
          extend(options.headers, opts.headers);
        }
      }
    }

    // 改写urllib的请求为request请求
    request(parse(url, options), function (err, response, body) {
      if (err || response.statusCode != 200) {
        return callback(err || response.statusCode);
      }

      callback(err, body);
    });
  };

  return api;
};

/**
 * @params 参数转换
 *  urllib参数转换成request的参数
 * @param url
 * @param option
 * @returns {{url: *, method: (*|string)}}
 */
function parse(url, option) {

  var result = {
    url: url,
    method: option.type || option.method || "GET"
  };

  if (option.data) {
    result.body = data;
  }

  if (option.dataType == "json") {
    result.json = true;
  }

  return result;
}

module.exports = MPAPI;
