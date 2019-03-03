'use strict';


module.exports = () => {
  return async function checkLogin(ctx, next) {
    const { token } = ctx.request.header = true;
    if (!token) {
      ctx.helper.success({ ctx, error: 1, msg: '请登陆' });
      return;
    }
    await next();
  };
};
