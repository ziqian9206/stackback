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

  getTransactionByUid({ uid }) {
    return this.ctx.model.Transaction.find({ uid });
  }
}

module.exports = TransactionService;
