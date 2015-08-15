/**
 * @file 微信
 * 公众平台
 *
 * mp: 公众平台 回复功能
 * mpapi: 公众平台 主动调用功能
 * open: 开放平台
 * enterprise: 企业号
 *
 *
 * http://admin.starwall.org/wechat/mp
 * http://admin.starwall.org/wechat/open
 * http://admin.starwall.org/wechat/enterprise
 * @author r2space@gmail.com
 * @module light.bridge.wechat.mp
 * @version 1.0.0
 */

"use strict";

var API = require("wechat-api");

exports.getJsConfig = function (option, callback) {

  var api = new API(option.appid, option.secret);
  api.getJsConfig({debug: true, jsApiList: ["chooseImage", "uploadImage"], url: option.url}, callback);
};

exports.getMedia = function(option, callback) {

  var api = new API(option.appid, option.secret);
  api.getMedia(option.id, callback);
};
