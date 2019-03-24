'use strict';

const Controller = require('egg').Controller;

const MongoObjectIdSchema = {
  type: 'string',
  format: /^[0-9a-f]{24}$/i,
};

class UserController extends Controller {

  // 注册
  async register() {
    const { ctx } = this;
    const { body } = ctx.request;
    const registerRule = {
      account: { type: 'string' },
      password: { type: 'string' },
    };
    ctx.validate(registerRule, body);

    // 储存新注册用户
    const { account, password } = body;

    const existUser = await ctx.service.user.existUser(account);

    if (existUser) {
      ctx.helper.error({ ctx, error: 103, msg: '该用户已存在，请勿重复注册' });
      return;
    }

    const user = await ctx.service.user.newUser({ account, password });
    await ctx.service.funds.setting(user._id);
    ctx.helper.success({ ctx,
      res: {
        uid: user._id,
        account: user.account,
        password: user.password,
      },
    });
  }

  // 登录
  async login() {
    const { ctx } = this;
    const query = ctx.query;
    const loginRule = {
      account: { type: 'string' },
      password: { type: 'string' },
    };

    ctx.validate(loginRule, query);
    // 获取用户账户
    const { account, password } = ctx.query;
    const user = await ctx.service.user.login({ account, password });
    console.log('....>', user);
    if (user) {
      ctx.helper.success({
        ctx,
        res: { uid: user._id, account: user.account },
      });
    } else {
      ctx.helper.error({ ctx, error: 102, msg: '账户或者密码不正确' });
    }
  }

  // 获取用户信息
  async getUserInfo() {
    const { ctx } = this;
    const uid = ctx.params.uid;
    if (!uid) {
      ctx.helper.error({ ctx, msg: 'uid不能为空' });
    }

    ctx.validate({ uid: MongoObjectIdSchema }, ctx.params);

    const userFund = await ctx.service.funds.getUserFund(uid);
    let stocks = await ctx.service.stock.getUserStocks(uid);

    if (!stocks) stocks = [];

    const response = {
      uid: userFund.uid,
      init: userFund.value,
      current: userFund.currentValue,
      stocks,
    };
    ctx.helper.success({ ctx, res: response });
  }

}

module.exports = UserController;
