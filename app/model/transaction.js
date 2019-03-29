'use strict';


module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const ObjectId = Schema.ObjectId;

  const TransactionSchema = new Schema({
    uid: { type: ObjectId },
    sid: { type: String },
    sname: { type: String },
    action: { type: Number }, // 交易的类型，买|卖
    count: { type: Number }, // 成交的数量
    price: { type: Number }, // 成交的单价
    success: { type: Number }, // 交易类型 委托|成功交易
    totalFund: { type: Number }, // 成交的总金额
    earning: { type: Number }, // 交易盈亏金额
    mock: { type: Number },
    time: { type: Number },
  });

  return mongoose.model('transaction', TransactionSchema);
};
