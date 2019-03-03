'use strict';


module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const ObjectId = Schema.ObjectId;

  const TransactionSchema = new Schema({
    uid: { type: ObjectId },
    action: { type: Number },
    sid: { type: String },
    count: { type: Number },
    price: { type: Number },
    success: { type: Number },
    time: { type: Number },
  });

  return mongoose.model('user-transactions', TransactionSchema);
};
