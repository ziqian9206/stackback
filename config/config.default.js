/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = {};

  config.name = 'SimulatedStockService';

  config.description = 'SimulatedStockService: 模拟炒股后端服务.';

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1551160981169_1959';

  // add your middleware config here, 配置需要的中间件，数组顺序即为中间件的加载顺序
  config.middleware = [ 'gzip' ];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
    // 配置 gzip 中间件的配置
    gzip: {
      enable: true,
      threshold: 1024, // 小于 1k 的响应体不压缩
    },
  };

  /**
   * @see http://mongodb.github.io/node-mongodb-native/2.2/api/Db.html#createCollection
   */
  config.mongoose = {
    url: 'mongodb://127.0.0.1:27017/stocks-service', // process.env.MONGODB_URL
    // url: 'mongodb://118.24.8.141:27017/stock-simulation',
    options: {
      server: { poolSize: 20 },
      reconnectTries: 10,
      reconnectInterval: 500,
      keepAlive: 120 // 对于长期运行的后台应用，启用毫秒级 keepAlive 是一个精明的操作。不这么做你可能会经常 收到看似毫无原因的 "connection closed" 错误。
    },
  };

  config.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
  };

  config.security = {
    csrf: {
      enable: false,
      // ignore: '/v1/*/*',
    },
    domainWhiteList: [ '*' ],
  };

  return {
    ...config,
    ...userConfig,
  };
};
