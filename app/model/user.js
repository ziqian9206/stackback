'use strict';

const bcrypt = require('bcrypt');

const SALT_WORK_FACTOR = 10;

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const UserSchema = new Schema({
    account: { type: String },
    password: { type: String },
  });

  UserSchema.index({ account: 1 }); //1表示升序索引，-1表示降序索引

  UserSchema.pre('save', function(next) {
    const user = this;
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
      if (err) return next(err);

      // hash the password using our new salt
      bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) return next(err);
        // override the cleartext password with the hashed one
        user.password = hash;
        next();
      });
    });
  });

  UserSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  };

  return mongoose.model('account', UserSchema);
};
