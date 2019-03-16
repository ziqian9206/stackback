'use strict';

const Controller = require('egg').Controller;
const iconv = require('iconv-lite');

const MongoObjectIdSchema = {
  type: 'string',
  format: /^[0-9a-f]{24}$/i,
};

const TransactionRules = {
  uid: MongoObjectIdSchema,
  sid: { type: 'string' },
  count: { type: 'number' },
  price: { type: 'number' },
};

const RecordRules = {
  uid: MongoObjectIdSchema,
  sid: { type: 'string' },
  sname: { type: 'string' },
  action: { type: 'number' }, // 交易的类型，买|卖
  count: { type: 'number' }, // 成交的数量
  price: { type: 'number' }, // 成交的单价
  totalFund: { type: 'number' }, // 成交的总金额
  earning: { type: 'number' }, // 盈亏金额
  // rate: { type: 'number' }, // 收益率
  time: { type: 'number' }, // 交易时间
};

const TransactionType = {
  sell: 0, // 卖出
  buy: 1, // 买入
};

class TransactionController extends Controller {

  async buy() {
    const { ctx } = this;
    const { body } = ctx.request;
    ctx.validate(TransactionRules, body);

    const { uid, sid, count, price } = body;
    const userFund = await ctx.service.funds.getUserFund(uid);
    const stockInfo = await ctx.service.stock.getStockInfo(sid);

    // TODO：首先判断要购买的股数是否超过了可购买的股数

    // 用户当前的交易是委托还是直接完成 success： 0： 委托， 1: 完成
    const stockInfoGBK = iconv.decode(stockInfo.data, 'gbk').split(',');
    const symbol = stockInfoGBK[0].match(/(sh|sz)\d+/g)[0]; // 0: 股票代码
    const name = stockInfoGBK[0].match(/[\u4E00-\u9FA5]+/g)[0]; // 0: 股票名字
    const currentPrice = Number(stockInfoGBK[3]); // [3]当前价格


    // 如果当前股票的实时价格超过了用户的购价，则委托。等到股票实时价格下降到用户的出价则成交。
    // 否则立即成交
    const success = currentPrice > price ? 0 : 1;

    const totalFund = price * count; // 成交总金额

    const taxes = totalFund / 1000; // 税费买入千分之一，卖出五百分之一

    const userFundNow = userFund.currentValue - totalFund - taxes; // 用户现在的钱， 买入之前的钱 - 买入股票的总价 - 税费


    // 判断用户资金是否可以买入当前的数量
    if (userFundNow < 0) {
      ctx.helper.error({ ctx, error: 110, msg: '资金不足，无法购买' });
      return;
    }

    const earning = 0; // 交易盈亏金额：买入的时候为0。

    const transactionTime = Date.now();

    // 存储交易记录
    const action = await ctx.service.transaction.action({ uid, sid, sname: name, action: TransactionType.buy, count, price, success, totalFund, earning, mock: 0, transactionTime });

    // 委托和成交，都要改变用户当前的资金。
    await ctx.service.funds.changeUserFund(uid, userFundNow);

    // 成交还需要改变用户所持股票
    if (success) {
      await ctx.service.stock.changeUserStocks({ uid, symbol, name, held: count, transactionTime });
    }

    ctx.helper.success({ ctx, res: action });
  }

  async sell() {
    const { ctx } = this;
    const { body } = ctx.request;
    ctx.validate(TransactionRules, body);

    const { uid, sid, count, price } = body;
    // TODO：首先判断要购买的股数是否超过了可购买的股数

    // TODO：判断用户资金是否可以买入当前的数量

    // 用户当前的交易是委托还是直接完成 success： 0： 委托， 1: 完成
    const stockInfo = await ctx.service.stock.getStockInfo(sid);
    const stockInfoGBK = iconv.decode(stockInfo.data, 'gbk').split(',');
    const currentPrice = Number(stockInfoGBK[3]); // [3]当前价格

    // 如果当前股票的实时价格高于用户的售价，则立刻成交。否则委托。
    const success = currentPrice > price ? 1 : 0;

    // 判断买入交易是委托还是立刻执行
    const action = await ctx.service.transaction.action({ action: TransactionType.sell, uid, sid, count, price, success });
    ctx.helper.success({ ctx, res: action });
  }

  async record() {
    const { ctx } = this;
    const { body } = ctx.request;
    ctx.validate(RecordRules, body);
    const { uid, sid, sname, action, count, price, totalFund, earning, time } = body;

    const mock = 1;
    const res = await ctx.service.transaction.record({ uid, sid, sname, action, count, price, success: 1, totalFund, earning, mock, time });
    ctx.helper.success({ ctx, res });
  }

  async getUserTransaction() {
    const { ctx } = this;
    const uid = ctx.params.uid;
    ctx.validate({ uid: MongoObjectIdSchema }, ctx.params);

    const res = await ctx.service.transaction.getTransactionByUid({ uid });
    ctx.helper.success({ ctx, res });
  }
}

module.exports = TransactionController;
