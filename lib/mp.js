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

var API = require("wechat-api")
  , config = light.framework.config.wechat;

exports.getJsConfig = function (callback) {

  var api = new API(config.mp.appid, config.mp.secret);

  api.getJsConfig({debug: true, jsApiList: ["chooseImage", "uploadImage"]}, callback);
};
