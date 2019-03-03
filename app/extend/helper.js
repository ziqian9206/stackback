'use strict';


const moment = require('moment');

// 格式化时间
exports.formatTime = time => moment(time).format('YYYY-MM-DD HH:mm:ss');

// 处理成功响应
exports.success = ({ ctx, error = 0, msg = '请求成功', res = null }) => {
  ctx.body = {
    error,
    msg,
    service: moment().format(),
    data: res,
  };
  ctx.status = 200;
};

exports.error = ({ ctx, error = 500, msg = '请求失败' }) => {
  ctx.body = {
    error,
    msg,
    service: moment().format(),
  };
  ctx.status = 200;
};

exports.eggValidate = ({ ctx, rule, params }) => {
  try {
    ctx.validate(rule, params);
  } catch (error) {
    this.error({ ctx, error: 101, msg: `参数错误：${error.errors[0].field}` });
    return;
  }
};
