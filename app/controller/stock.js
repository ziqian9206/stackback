'use strict';

const Controller = require('egg').Controller;
const iconv = require('iconv-lite');

const MongoObjectIdSchema = {
  type: 'string',
  format: /^[0-9a-f]{24}$/i,
};

class HomeController extends Controller {

  async info() {
    const { ctx } = this;
    const sid = ctx.params.sid;
    if (!sid) {
      ctx.helper.error({ ctx, msg: 'sid不能为空' });
      return;
    }
    console.log('>>>>>>', sid);
    const stockInfo = await ctx.service.stock.getStockInfo(sid);
    const stockInfoGBK = iconv.decode(stockInfo.data, 'gbk').split(',');
    if (stockInfoGBK.length < 2) {
      ctx.helper.error({ ctx, error: 101, msg: '没有查询到该股票' });
    } else {
      const info = {
        sid: stockInfoGBK[0].match(/(sh|sz)\d+/g)[0], // 0: 股票代码
        name: stockInfoGBK[0].match(/[\u4E00-\u9FA5]+/g)[0], // 0: 股票名字
        yesterdayEnd: stockInfoGBK[2], // 昨日收盘价
        trade: stockInfoGBK[1], // 今日开盘价格
        currentPrice: stockInfoGBK[3], // 当前价格
        time: `${stockInfoGBK[30]} ${stockInfoGBK[31]}`, // 时间
      };
      ctx.helper.success({ ctx, res: info });
    }
  }

  async hold() {
    const { ctx } = this;
    const uid = ctx.params.uid;
    const sid = ctx.query.sid;
    if (!uid) {
      ctx.helper.error({ ctx, msg: 'uid不能为空' });
    }

    // const res = await ctx.service.transaction.getUserHoldByUid({ uid });
    const res = await ctx.service.stock.getUserStocksById(uid, sid);
    if (sid) {
      ctx.helper.success({ ctx, res: res[0] });
      return;
    }
    ctx.helper.success({ ctx, res });
  }


  async commission() {
    const { ctx } = this;
    console.log('==========> commission:', ctx.params, ctx.query);
    const uid = ctx.params.uid;
    if (!uid) {
      ctx.helper.error({ ctx, msg: 'uid不能为空' });
      return;
    }
    ctx.validate({ uid: MongoObjectIdSchema }, ctx.params);

    const params = {};

    params.uid = uid;

    if (ctx.query.hasOwnProperty('starttime') && ctx.query.hasOwnProperty('endtime')) {
      params.starttime = ctx.query.starttime;
      params.endtime = ctx.query.endtime;
    }

    const res = await ctx.service.transaction.getUserCommissionByUid(params);
    ctx.helper.success({ ctx, res });
  }

  async revokeCommission() {
    const { ctx } = this;
    console.log('==========> revokeCommission:', ctx.params, ctx.query);
    const _id = ctx.params.id;
    if (!_id) {
      ctx.helper.error({ ctx, msg: 'id不能为空' });
      return;
    }

    const res = await ctx.service.transaction.revokeCommissionById(_id);
    ctx.helper.success({ ctx, res });
  }
}

module.exports = HomeController;
