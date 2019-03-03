'use strict';

const Service = require('egg').Service;

class TransactionService extends Service {

  action({ action, uid, sid, count, price, success, transactionTime }) {
    const transaction = new this.ctx.model.Transaction();
    transaction.uid = uid;
    transaction.action = action;
    transaction.sid = sid;
    transaction.count = count;
    transaction.price = price;
    transaction.time = transactionTime;
    transaction.success = success;
    return transaction.save();
  }
}

module.exports = TransactionService;
