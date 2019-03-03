'use strict';

// const utility = require('utility');

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const UserSchema = new Schema({
    account: { type: String },
    password: { type: String },
  });

  // UserSchema.index({ unique: true });
  // UserSchema.index({ email: 1 }, { unique: true });
  // UserSchema.index({ score: -1 });
  // UserSchema.index({ githubId: 1 });
  // UserSchema.index({ accessToken: 1 });

  return mongoose.model('user-account', UserSchema);
};
