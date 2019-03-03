'use strict';


module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const ObjectId = Schema.ObjectId;

  const StockSchema = new Schema({
    uid: { type: ObjectId },
    symbol: { type: String },
    name: { type: String },
    held: { type: Number },
    transactionTime: { type: Number },
  });

  return mongoose.model('user-stock', StockSchema);
};
