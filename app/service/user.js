'use strict';

const Service = require('egg').Service;

class UserService extends Service {
  /*
   * 新用户注册存储
   */
  async newUser({ account, password }) {
    const user = new this.ctx.model.User();
    user.account = account;
    user.password = password;
    return user.save();
  }

  login({ account, password }) {
    const query = { account, password };
    return this.ctx.model.User.findOne(query).exec();
  }

  getUserInfo(uid) {
    const query = { _id: uid }
    return this.ctx.model.User.findOne(query).exec();
  }
}

module.exports = UserService;
