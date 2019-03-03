'use strict';


const Service = require('egg').Service;

class StockService extends Service {
  // 获取用户持股
  getUserStocks(uid) {
    return this.ctx.model.Stock.findOne({ uid });
  }

  getStockInfo(sid) {
    return this.ctx.curl(`http://hq.sinajs.cn/list=${sid}`);
  }

  changeUserStocks({ uid, symbol, name, held, transactionTime }) {
    const stock = this.ctx.model.Stock();
    stock.uid = uid;
    stock.symbol = symbol;
    stock.name = name;
    stock.held = held;
    stock.transactionTime = transactionTime;
    console.log('changeUserStocks:::::>', uid, symbol, name, typeof held, transactionTime, stock);
    return stock.save();
  }
}

module.exports = StockService;
