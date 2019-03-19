'use strict';

const Service = require('egg').Service;

class TransactionService extends Service {

  action({ action, uid, sid, sname, count, price, success, totalFund, earning, mock, transactionTime }) {
    const transaction = new this.ctx.model.Transaction();
    transaction.uid = uid;
    transaction.sid = sid;
    transaction.sname = sname;
    transaction.action = action;
    transaction.count = count;
    transaction.price = price;
    transaction.success = success;
    transaction.totalFund = totalFund;
    transaction.earning = earning;
    transaction.mock = mock;
    transaction.time = transactionTime;
    return transaction.save();
  }

  record({ uid, sid, sname, action, count, price, totalFund, earning, mock, time }) {
    const transaction = new this.ctx.model.Transaction();
    transaction.uid = uid;
    transaction.sid = sid;
    transaction.sname = sname;
    transaction.action = action;
    transaction.count = count;
    transaction.price = price;
    transaction.success = 1; // 模拟记录总是成功
    transaction.totalFund = totalFund;
    transaction.earning = earning;
    transaction.mock = mock;
    transaction.time = time;
    return transaction.save();
  }

  getTransactionByUid(params) {
    return this.ctx.model.Transaction.find({
      uid: params.uid,
      success: 1,
      time: { $gte: params.starttime || 0, $lte: params.endtime || Date.now() },
    }).exec();
  }

  /**
   * 通过uid查询用户持有的股票
   * @param {Object} params {uid}
   * @return {Promise} 查询返回的 Promise 对象
   */
  getUserHoldByUid({ uid }) {
    return this.ctx.model.Transaction.find({
      uid,
      success: 1,
      action: 1,
    }).exec();
  }

  /**
   * 通过uid查询用户委托的股票
   * @param {Object} params {用户ID，时间}
   * @return {Promise} 查询返回的 Promise 对象
   */
  getUserCommissionByUid(params) {
    return this.ctx.model.Transaction.find({
      uid: params.uid,
      success: 0,
      time: { $gte: params.starttime || 0, $lte: params.endtime || Date.now() },
    }).exec();
  }

  async revokeCommissionById(id) {
    // return this.ctx.model.Transaction.findByIdAndDelete({ _id: id }).exec();
    return this.ctx.model.Transaction.findByIdAndRemove({ _id: id }).exec();
  }
}

module.exports = TransactionService;
