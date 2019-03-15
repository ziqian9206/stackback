'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  // const checkLogin = app.middleware.checkLogin();
  // 基础
  router.get('/', controller.home.index);

  // 注册用户
  router.post('/v1/register', controller.user.register);

  // 用户登录
  router.get('/v1/login', controller.user.login);

  // 获取用户信息
  router.get('/v1/user/:uid', controller.user.getUserInfo);

  // 股票实时信息
  router.get('/v1/stock/:sid', controller.stock.info);

  // 股票买入
  router.post('/v1/transaction/buy', controller.transaction.buy);

  // 股票卖出
  router.post('/v1/transaction/sell', controller.transaction.sell);

  // 新增交易记录
  router.post('/v1/transaction/record', controller.transaction.record);

  // 获取交易记录
  router.get('/v1/transaction/:uid', controller.transaction.getUserTransaction);

};
