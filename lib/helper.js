/**
 * @file 工具类
 * @module lib.helper
 * @author r2space@gmail.com
 * @version 1.0.0
 */

'use strict';

exports.post = function (url, data) {
  return {
    url: url,
    method: 'POST',
    proxy: process.env.DEV ? undefined : config.app.proxy,
    headers: {'content-type': 'application/json'},
    form: data
  };
};

exports.get = function (url, data) {
  return {
    url: url,
    method: 'GET',
    proxy: process.env.DEV ? undefined : config.app.proxy
  };
};
