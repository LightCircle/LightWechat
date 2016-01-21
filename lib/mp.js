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

var wechat = require("./enterprise");

exports.verify = function (handler) {
  wechat.verify(handler);
};

exports.listen = function (handler, callback) {
  wechat.listen(handler, callback);
};

//exports.getJsConfig = function (option, callback) {
//
//  var api = new API(option.appid, option.secret);
//  api.getJsConfig({debug: true, jsApiList: ["chooseImage", "uploadImage"], url: option.url}, callback);
//};
//
//exports.getMedia = function(option, callback) {
//
//  var api = new API(option.appid, option.secret);
//  api.getMedia(option.id, callback);
//};
//
//
//exports.sendTemplate = function (option, callback) {
//
//  //* openid 用户的openid
//  //* templateId 模板ID
//  //* url URL置空，则在发送后，点击模板消息会进入一个空白页面（ios），或无法点击（android）
//  //* topColor 顶部颜色
//  //* data 渲染模板的数据
//  //* callback 回调函数
//
//  var api = new API(option.appid, option.secret);
//
//  api.sendTemplate(
//    option.openid,
//    "T4cqfxOF_gt3SDd-HDvIt6TRvOiO84L3UDNh6kiYd9o",
//    null,
//    "#FF0000", {
//      first: "营运稽核检查表检查标准",
//      keyword1: "待处理任务：有待改善",
//      keyword2: "通知类型：检查",
//      keyword3: "2015年11月16日",
//      remark: "请尽快处理"
//    },
//    callback
//  );
//};
//
//
//exports.getUserList = function (option, callback) {
//
//  var api = new API(option.appid, option.secret);
//  api.getFollowers(null, callback);
//};