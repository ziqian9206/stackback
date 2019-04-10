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

  admin({ account, admin }) {
    const query = { account };
    const update = { $set: { admin } };
    // return this.ctx.model.User.findOneAndUpdate(query, update).exec();
    console.log('query:', query, 'update:', update);
    return this.ctx.model.User.findOneAndUpdate(query, update).exec();
  }

  findAdmin() {
    return this.ctx.model.User.find({ admin: 1 });
  }
}

module.exports = UserService;
