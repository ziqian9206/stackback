'use strict';


module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const ObjectId = Schema.ObjectId;

  const StockSchema = new Schema({
    uid: { type: ObjectId },
    sid: { type: String },
    name: { type: String },
    hold: { type: Number },
    earning: { type: Number },
    transactionTime: { type: Number },
  });

  return mongoose.model('stock', StockSchema);
};
