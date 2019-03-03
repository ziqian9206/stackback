'use strict';

const Controller = require('egg').Controller;
const iconv = require('iconv-lite');

class HomeController extends Controller {

  async info() {
    const { ctx } = this;
    const sid = ctx.params.sid;
    if (!sid) {
      ctx.helper.error({ ctx, msg: 'sid不能为空' });
    }
    console.log('>>>>>>', sid);
    const stockInfo = await ctx.service.stock.getStockInfo(sid);
    const stockInfoGBK = iconv.decode(stockInfo.data, 'gbk').split(',');
    if (stockInfoGBK.length < 2) {
      ctx.helper.error({ ctx, error: 101, msg: '没有查询到该股票' });
    } else {
      const info = {
        symbol: stockInfoGBK[0].match(/(sh|sz)\d+/g)[0], // 0: 股票代码
        name: stockInfoGBK[0].match(/[\u4E00-\u9FA5]+/g)[0], // 0: 股票名字
        trade: stockInfoGBK[1], // 今日开盘价格
        currentPrice: stockInfoGBK[3], // 当前价格
        time: `${stockInfoGBK[30]} ${stockInfoGBK[31]}`, // 时间
      };
      ctx.helper.success({ ctx, res: info });
    }
  }
}

module.exports = HomeController;
