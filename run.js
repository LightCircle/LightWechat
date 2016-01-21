/**
 * @file 脚本文件
 * @module light-weichat.run
 * @author r2space@gmail.com
 * @version 1.0.0
 */

"use strict";

global.light  = require("light-core");

var log       = light.framework.log
  , cache     = light.framework.cache
  , context   = light.framework.context
  , rider     = light.model.rider
  , eapi      = require("./lib/enterprise_api")
  , mapi      = require("./lib/mp_api");
  ;

process.env.LIGHTDB_USER = "r2space";
process.env.LIGHTDB_PASS = "ranbow";
process.env.LIGHTDB_PORT = "57017";
process.env.APPNAME = "56648deee144";
process.env.DEV = true;

cache.manager.init(process.env.APPNAME, function (err) {
  if (err) {
    log.error(err);
    return process.exit(1);  // 初始化出错，拒绝启动
  }

  // 初始化rider
  rider.init();

  // 测试公众号的主动调用api
  new mapi().getJsConfig({
    debug: true,
    jsApiList: ["chooseImage", "uploadImage"],
    url: "http://56648deee144.app.alphabets.cn"
  }, function (err, result) {

    console.log(err, result);
  });

  // 测试企业号的主动调用api
  //eapi.sendText({touser: "r2space", text: {content: "测试 企业号 发送消息"}}, function (err, result) {
  //  console.log(err, result);
  //});

});
