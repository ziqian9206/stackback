'use strict';


module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const ObjectId = Schema.ObjectId;

  const FundSchema = new Schema({
    uid: { type: ObjectId },
    value: { type: Number, default: 100000 },
    currentValue: { type: Number, default: 100000 },
  });

  return mongoose.model('user-funds', FundSchema);
};
