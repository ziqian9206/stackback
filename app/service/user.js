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
    const user = { account, password };
    return this.ctx.model.User.findOne(user).exec();
  }

  getUserInfo(uid) {
    return this.ctx.model.User.findOne({ _id: uid }).exec();
  }
}

module.exports = UserService;
