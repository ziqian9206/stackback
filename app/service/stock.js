'use strict';


const Service = require('egg').Service;

class StockService extends Service {
  // 获取用户持股
  getUserStocks(uid) {
    return this.ctx.model.Stock.find({ uid }).exec();
  }

  getUserStocksById(uid, sid) {
    if (sid) {
      return this.ctx.model.Stock.find({ uid, sid }).exec();
    }
    return this.ctx.model.Stock.find({ uid }).exec();
  }

  getUserStockById({ uid, sid }) {
    return this.ctx.model.Stock.find({ uid, sid }).exec();
  }

  getStockInfo(sid) {
    return this.ctx.curl(`http://hq.sinajs.cn/list=${sid}`);
  }

  changeUserStocks({ type, uid, sid, name, hold, earning, transactionTime }) {
    const stock = this.ctx.model.Stock();
    if (type === 1) {
      stock.uid = uid;
      stock.sid = sid;
      stock.name = name;
      stock.hold = hold;
      stock.earning = earning;
      stock.transactionTime = transactionTime;
      console.log('changeUserStocks:::::>', uid, sid, name, typeof hold, transactionTime, stock);
      return stock.save();
    }
  }

  updateUserStock({ uid, sid, hold, earning, transactionTime }) {
    console.log('updateUserStock:', uid, sid, hold, earning, transactionTime);
    const query = {uid, sid};
    const update = { $set: { hold, earning, transactionTime }};
    return this.ctx.model.Stock.findOneAndUpdate(query, update).exec();
  }

  removeUserStock({ uid, sid }) {
    return this.ctx.model.Stock.remove({ uid, sid }).exec();
  }
}

module.exports = StockService;
