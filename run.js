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
  , request   = light.util.request
  , eapi      = require("./lib/enterprise_api")
  , mapi      = require("./lib/mp_api");

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
  //new mapi().getJsConfig({
  //  debug: true,
  //  jsApiList: ["chooseImage", "uploadImage"],
  //  url: "http://56648deee144.app.alphabets.cn"
  //}, function (err, result) {
  //
  //  console.log(err, result);
  //});

  // 测试企业号的主动调用api
  //eapi.sendText({touser: "r2space", text: {content: "测试 企业号 发送消息"}}, function (err, result) {
  //  console.log(err, result);
  //});

  // 模拟微信公众号的请求
  var address = "http://127.0.0.1:45677/api/mp";
  request({
    url: address + "?signature=22d858080d90ae3d4287af5a274ddea9f3f91d69&timestamp=1453384970&nonce=1197800808&encrypt_type=aes&msg_signature=2b01bd26dae539ad5c3d935e7478e551efbd8895",
    method: "POST",
    json: true,
    body: {
      xml: {
        tousername: 'gh_3b7433d224e6',
        encrypt: '/acFveSgK0PzHxsnaUKuzSVo36orD29jLYBY8tui57hu/CRBPy9+LEAIuD+nxkiZd6EE8ks/pvsJZeZRat1pfvtF85EkFkZ8oFsYGnuLiQKD+nvXT7HxR5yMpsoosPe4u4166ysLINehiTuWNmKqYPb6RedqweF0GALTcZXNckDMX1ETtaMp1rSYYUPX6POPeQD5bx5Dmywzy95jBhO7BfIW6KWlGZgb6J3pGkF+UX5go4oPv2tFoxNWNH4q/iPlpjCeyTeroig2uT5UL2GwJ7ggPXgZ6huXVjzooEQi+ZVuopDjcKbD6IRQH365/acAHlc5fYjcMclNfUI6oE8KYS0zax+JrXVJ7ycIpDgYemOZt1dq3jM5yXZbSUGosV4F1EXEqmLX0ZUmZu2u9TFl67/cdLG3q8v+w4M5BvOQTiAGUrgCLAeEm9wHz4tsydmXzOlEasPXom+S5EfS7mbbEw=='
      }
    }
  }, function (err, response, body) {

    console.log(err, body);
    process.exit(0);
  })


});
