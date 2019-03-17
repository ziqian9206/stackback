'use strict';


const Service = require('egg').Service;

class StockService extends Service {
  // 获取用户持股
  getUserStocks(uid) {
    return this.ctx.model.Stock.find({ uid });
  }

  getUserStockById({ uid, sid }) {
    return this.ctx.model.Stock.find({ uid, sid });
  }

  getStockInfo(sid) {
    return this.ctx.curl(`http://hq.sinajs.cn/list=${sid}`);
  }

  changeUserStocks({ type, uid, symbol, name, hold, earning, transactionTime }) {
    const stock = this.ctx.model.Stock();
    if (type === 1) {
      stock.uid = uid;
      stock.sid = symbol;
      stock.name = name;
      stock.hold = hold;
      stock.earning = earning;
      stock.transactionTime = transactionTime;
      console.log('changeUserStocks:::::>', uid, symbol, name, typeof hold, transactionTime, stock);
      return stock.save();
    }
  }

  updateUserStock({ uid, symbol, hold, earning, transactionTime }) {
    console.log('updateUserStock:', uid, symbol, hold, earning, transactionTime);
    return this.ctx.model.Stock.updateOne({ uid, symbol, hold, earning, transactionTime });
  }

  removeUserStock({ uid, symbol }) {
    return this.ctx.model.Stock.remove({ uid, symbol });
  }
}

module.exports = StockService;
