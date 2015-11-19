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
  , constant  = require("./constant")
  , mp        = require("./lib/mp")
  ;

process.env.LIGHTDB_USER = "admin";
process.env.LIGHTDB_PASS = "ShotEyes";
process.env.LIGHTDB_PORT = "57017";
process.env.APPNAME      = "628f1c81af5c";
process.env.DEV          = true;

cache.manager.init(process.env.APPNAME, function(err) {
  if (err) {
    log.error(err);
    return process.exit(1);  // 初始化出错，拒绝启动
  }

  // 初始化rider
  rider.init();

  //mp.sendTemplate({
  //  appid: "wx995ebbd601a092d7",
  //  secret: "e158c151364df166990eec07d4ed0a6a",
  //  openid: ""
  //}, function (err, result) {
  //  console.log(err, result);
  //});

  mp.getUserList({
    appid: "wxa1845c58a74d8579",
    secret: "8f099156c54adee1048875f890003de5"
  }, function (err, result) {
    console.log(err, result);
  });

});
