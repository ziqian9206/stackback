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
  type: { type: 'number' },
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

    const { uid, sid, count, price, type } = body;
    const userFund = await ctx.service.funds.getUserFund(uid);
    const stockInfo = await ctx.service.stock.getStockInfo(sid);
    const userStockInfo = await ctx.service.stock.getUserStockById({ uid, sid });
    console.log('userStockInfo:', userStockInfo);
    // TODO：首先判断要购买的股数是否超过了可购买的股数

    const stockInfoGBK = iconv.decode(stockInfo.data, 'gbk').split(',');
    // const symbol = stockInfoGBK[0].match(/(sh|sz)\d+/g)[0]; // 0: 股票代码
    const name = stockInfoGBK[0].match(/[\u4E00-\u9FA5]+/g)[0]; // 0: 股票名字
    const currentPrice = Number(stockInfoGBK[3]); // [3]当前价格

    // 用户当前的交易是委托还是直接完成 success： 0： 委托， 1: 完成
    // 如果当前股票的实时价格超过了用户的购价，则委托。等到股票实时价格下降到用户的出价则成交。
    // 否则立即成交

    let success = null;
    let taxes = null;
    let userFundNow = null;
    const totalFund = price * count; // 成交总金额
    let earning = 0;
    const transactionTime = Date.now();

    if (type === 1) {
      success = currentPrice > price ? 0 : 1;
      taxes = totalFund / 1000; // 税费买入千分之一，卖出五百分之一
      userFundNow = userFund.currentValue - totalFund - taxes; // 用户现在的钱， 买入之前的钱 - 买入股票的总价 - 税费

      // 判断用户资金是否可以买入当前的数量
      if (userFundNow < 0) {
        ctx.helper.error({ ctx, error: 110, msg: '资金不足，无法购买' });
        return;
      }

      earning = 0 - price * count - taxes;

      // 成交还需要改变用户所持股票
      if (success && userStockInfo.length === 0) {
        await ctx.service.stock.changeUserStocks({ type, uid, sid, name, hold: count, earning, transactionTime });
      } else if (success && userStockInfo.length > 0) {

        const hold = userStockInfo[0].hold + count;
        earning = userStockInfo[0].earning + earning;

        console.log('updateUserStock=>', uid, sid, hold, earning, transactionTime);

        await ctx.service.stock.updateUserStock({ uid, sid, hold, earning, transactionTime });
      }

    } else {

      success = price < currentPrice ? 0 : 1;
      taxes = totalFund / 500; // 税费买入千分之一，卖出五百分之一
      userFundNow = userFund.currentValue + totalFund - taxes; // 用户现在的钱， 买入之前的钱 - 买入股票的总价 - 税费

      if (userStockInfo[0].hold < count) {
        ctx.helper.error({ ctx, error: 110, msg: '持仓数量不足，无法交易' });
        return;
      }

      earning = price * count - taxes - userStockInfo[0].earning;

      if (success && count < userStockInfo[0].hold) {

        const hold = userStockInfo[0].hold - count;
        earning = userStockInfo[0].earning + earning;

        await ctx.service.stock.updateUserStock({ uid, sid, hold, earning, transactionTime });

      } else if (success && count === userStockInfo[0].hold) {
        await ctx.service.stock.removeUserStocks({ uid, sid });
      }

    }

    // 存储交易记录
    const action = await ctx.service.transaction.action({ uid, sid, sname: name, action: TransactionType.buy, count, price, success, totalFund, earning, mock: 0, transactionTime });

    // 委托和成交，都要改变用户当前的资金。
    await ctx.service.funds.changeUserFund(uid, userFundNow);

    ctx.helper.success({ ctx, res: action });
  }

  async record() {
    const { ctx } = this;
    const { body } = ctx.request;

    console.log('>>>>>>>>>>', 'record:')
    try {
      ctx.validate(RecordRules, body);
    } catch (err) {
      ctx.helper.error({ ctx, error: 115, msg: err });
    }
    
    let { uid, sid, sname, action, count, price, totalFund, earning, time } = body;
    uid = uid.trim();
    sid = sid.trim();
    sname = sname.trim();
    action = parseInt(action, 10);
    count = parseInt(count, 10);
    price = parseFloat(price, 10);
    totalFund = parseFloat(totalFund, 10);
    earning = parseFloat(earning, 10);
    console.log('record, params:', uid, sid, sname, action, count, price, totalFund, earning, time)
    const mock = 1;
    // 写入交易记录
    const res = await ctx.service.transaction.record({ uid, sid, sname, action, count, price, success: 1, totalFund, earning, mock, time });
    const userStockInfo = await ctx.service.stock.getUserStockById({ uid, sid });

    let taxes = null;
    let userFundNow = null;
    const userFund = await ctx.service.funds.getUserFund(uid);
    
    if (action) {
      // 买入修改资金逻辑
      taxes = totalFund / 1000; // 税费买入千分之一，卖出五百分之一
      userFundNow = userFund.currentValue - totalFund - taxes; // 用户现在的钱， 买入之前的钱 - 买入股票的总价 - 税费

      // 成交还需要改变用户所持股票
      console.log('userStockInfo.length:', userStockInfo.length)
      if (userStockInfo.length === 0) {
        await ctx.service.stock.changeUserStocks({ type: action, uid, sid, name:sname, hold: count, earning, transactionTime: time });
      } else if (userStockInfo.length > 0) {
        console.log(userStockInfo[0].hold, count, userStockInfo[0].earning, earning)
        const hold = userStockInfo[0].hold + count;
        earning = userStockInfo[0].earning + earning;

        console.log('updateUserStock=++>', uid, sid, hold, earning, time);

        await ctx.service.stock.updateUserStock({ uid, sid, hold, earning, transactionTime: time });
      }

    } else {
      // 卖出修改资金逻辑
      taxes = totalFund / 500; // 税费买入千分之一，卖出五百分之一
      userFundNow = userFund.currentValue + totalFund - taxes; // 用户现在的钱， 买入之前的钱 - 买入股票的总价 - 税费

      if (userStockInfo.length === 0) {
        ctx.helper.error({ ctx, error: 155, msg: '没有这只股票，无法卖出' });
        return
      }

      earning = price * count - taxes - userStockInfo[0].earning;
      if (count < userStockInfo[0].hold) {

        const hold = userStockInfo[0].hold - count;
        earning = userStockInfo[0].earning + earning;

        await ctx.service.stock.updateUserStock({ uid, sid, hold, earning, transactionTime: time });

      } else {
        await ctx.service.stock.removeUserStocks({ uid, sid });
      }

    }
    
    // 改变用户当前的资金。
    await ctx.service.funds.changeUserFund(uid, userFundNow);

    ctx.helper.success({ ctx, res });
  }

  async getUserTransaction() {
    const { ctx } = this;
    console.log('==========> getUserTransaction:', ctx.params, ctx.query);
    const uid = ctx.params.uid;
    ctx.validate({ uid: MongoObjectIdSchema }, ctx.params);

    const params = {};

    params.uid = uid;

    if (ctx.query.hasOwnProperty('starttime') && ctx.query.hasOwnProperty('endtime')) {
      params.starttime = ctx.query.starttime;
      params.endtime = ctx.query.endtime;
    }

    const res = await ctx.service.transaction.getTransactionByUid(params);
    ctx.helper.success({ ctx, res });
  }
}

module.exports = TransactionController;
