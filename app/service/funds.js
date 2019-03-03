'use strict';


const Service = require('egg').Service;

class FundsService extends Service {
  // 设置用户资金
  setting(uid) {
    const fund = new this.ctx.model.Funds();
    fund.uid = uid;
    return fund.save();
  }

  getUserFund(uid) {
    return this.ctx.model.Funds.findOne({ uid });
  }

  changeUserFund(uid, currentValue) {
    const query = { uid };
    const update = { $set: { currentValue } };
    return this.ctx.model.Funds.findOneAndUpdate(query, update).exec();
  }
}

module.exports = FundsService;
