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

  async existUser(account) {
    const query = { account };
    return this.ctx.model.User.findOne(query).exec();
  }

  async login({ account, password }) {
    const query = { account };

    const user = await this.ctx.model.User.findOne(query).exec();

    if (await user.comparePassword(password)) {
      return user;
    }

    return null;
  }

  getUserInfo(uid) {
    const query = { _id: uid };
    return this.ctx.model.User.findOne(query).exec();
  }
}

module.exports = UserService;
