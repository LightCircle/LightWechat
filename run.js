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
  , async     = light.util.async;

process.env.LIGHTDB_USER = "test";
process.env.LIGHTDB_PASS = "test";
process.env.LIGHTDB_HOST = "db.alphabets.cn";
process.env.LIGHTDB_PORT = "57017";
process.env.APPNAME = "db";
process.env.DEV = true;

cache.manager.init(process.env.APPNAME, function (err) {
  if (err) {
    log.error(err);
    return process.exit(1);  // 初始化出错，拒绝启动
  }

  // 初始化rider
  rider.init();

  var eapi = require("./lib/ep/enterprise_api")
    , mapi = require("./lib/mp/mp_api")
    , xapi = require("./lib/xcx/api");

  // 小程序 code 换取 openid
  // xapi.jscode2session({code: '031pw5en0tOQko16F6dn0lEben0pw5es'}, function (err, res) {
  //   console.log(err, res);
  // });

  xapi.qrcode({path: "pages/profile/profile"}, function (err, res) {
    console.log(err, res);
  });

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
  //var address = "http://127.0.0.1:45677/api/mp";
  //request({
  //  url: address + "?signature=22d858080d90ae3d4287af5a274ddea9f3f91d69&timestamp=1453384970&nonce=1197800808&encrypt_type=aes&msg_signature=2b01bd26dae539ad5c3d935e7478e551efbd8895",
  //  method: "POST",
  //  json: true,
  //  body: {
  //    xml: {
  //      tousername: 'gh_3b7433d224e6',
  //      encrypt: '/acFveSgK0PzHxsnaUKuzSVo36orD29jLYBY8tui57hu/CRBPy9+LEAIuD+nxkiZd6EE8ks/pvsJZeZRat1pfvtF85EkFkZ8oFsYGnuLiQKD+nvXT7HxR5yMpsoosPe4u4166ysLINehiTuWNmKqYPb6RedqweF0GALTcZXNckDMX1ETtaMp1rSYYUPX6POPeQD5bx5Dmywzy95jBhO7BfIW6KWlGZgb6J3pGkF+UX5go4oPv2tFoxNWNH4q/iPlpjCeyTeroig2uT5UL2GwJ7ggPXgZ6huXVjzooEQi+ZVuopDjcKbD6IRQH365/acAHlc5fYjcMclNfUI6oE8KYS0zax+JrXVJ7ycIpDgYemOZt1dq3jM5yXZbSUGosV4F1EXEqmLX0ZUmZu2u9TFl67/cdLG3q8v+w4M5BvOQTiAGUrgCLAeEm9wHz4tsydmXzOlEasPXom+S5EfS7mbbEw=='
  //    }
  //  }
  //}, function (err, response, body) {
  //
  //  console.log(err, body);
  //  process.exit(0);
  //});


  // 创建基础菜单
  // var api = new mapi();
  //api.createMenu({
  //  "button": [
  //    {
  //      "name": "小工具",
  //      "sub_button": [
  //        {
  //          "type": "view",
  //          "name": "Postcard",
  //          "url": "http://56648deee144.app.alphabets.cn"
  //        }
  //      ]
  //    },
  //    {
  //      "name": "官网",
  //      "sub_button": [
  //        {
  //          "type": "view",
  //          "name": "字符科技主页",
  //          "url": "http://www.alphabets.cn"
  //        },
  //        {
  //          "type": "view",
  //          "name": "Light平台",
  //          "url": "http://light.alphabets.cn"
  //        }]
  //    }]
  //}, function (err, menu) {
  //  console.log(">>>>>", err, menu);
  //});

  // 创建个性化菜单
  //api.createCustomMenu({
  //  "button": [{
  //    "name": "小工具",
  //    "sub_button": [
  //      {
  //        "type": "view",
  //        "name": "Postcard",
  //        "url": "http://56648deee144.app.alphabets.cn"
  //      }
  //    ]
  //  }, {
  //    "name": "官网",
  //    "sub_button": [
  //      {
  //        "type": "view",
  //        "name": "字符科技主页",
  //        "url": "http://www.alphabets.cn"
  //      },
  //      {
  //        "type": "view",
  //        "name": "Light平台",
  //        "url": "http://light.alphabets.cn"
  //      }]
  //  }, {
  //    "name": "开发",
  //    "sub_button": [
  //      {
  //        "type": "view",
  //        "name": "NEC客流",
  //        "url": "http://56648deee144.app.alphabets.cn"
  //      }]
  //  }],
  //  matchrule: {group_id: 100}
  //}, function (err, menu) {
  //  console.log(">>>>>", err, menu);
  //});

  //api.getMenu(function (err, menu) {
  //  console.log(api);
  //  console.log(">>>>>", err, menu.conditionalmenu[0].button);
  //});

  // li : "od79Ew1oz9bEWv5IcPW6thlx_0Zo"
  // lwx : "od79Ewx5yjrnnrhAokTjpepf3sSE"
  //api.testCustomMenu("od79Ewx5yjrnnrhAokTjpepf3sSE", function (err, menu) {
  //  console.log(menu);
  //});
  //api.removeCustomMenu("406566251", function () {
  //});
  
  // 创建分组
  //api.createGroup("Alphabets", function (err, result) {
  //  api.getGroups(function (err, group) {
  //    console.log(err, group);
  //  });
  //});

  // 移动先帝到字符科技组
  //api.moveUserToGroup("od79Ewx5yjrnnrhAokTjpepf3sSE", "100", function (err, result) {
  //  console.log(err, result);
  //});

  // 预警信息发送
  //var url = "http://56648deee144.app.alphabets.cn/portfolio.html"
  //  , template = "0IG2gd47nochMEWsESRb84UENYqImvbbgofFwJ5GNys"
  //  , data = {
  //  first: {value: "您有一条预警通知，请您及时处理", color: "#366799"},
  //  keyword1: {value: "沈阳一方", color: "#366799"},
  //  keyword2: {value: "数据异常", color: "#366799"},
  //  keyword3: {value: "2016/01/22 13:43", color: "#366799"},
  //  remark: {value: "从2016/01/22 13:10起, 连续10分钟未接到客流数据", color: "#366799"}
  //};
  //api.sendTemplate("od79Ew1oz9bEWv5IcPW6thlx_0Zo", template, url, data, function (err, result) {
  //  console.log(err, result);
  //});

  // api.createTmpQRCode(10000, 60, function (err, result) {
  //
  //   console.log(result);
  //
  //   var url = api.showQRCodeURL(result.ticket);
  //   console.log(url);
  // });

});
