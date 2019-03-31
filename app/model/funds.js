'use strict';


module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const ObjectId = Schema.ObjectId;

  const FundSchema = new Schema({
    uid: { type: ObjectId },
    value: { type: Number, default: 1000000 },
    currentValue: { type: Number, default: 1000000 },
  });

  FundSchema.index({ uid: 1 }); //1表示升序索引，-1表示降序索引

  return mongoose.model('fund', FundSchema);
};
