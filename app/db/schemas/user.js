'use strict';

const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

var bcrypt = require('bcrypt-nodejs');

const SALT_WORK_FACTOR = 10;
const DEFAULT_AVATAR = '';

const UserSchema = new Schema({
	username: { type: String, unique: true, required: true, trim: true },
	email: { type: String, unique: true, trim: true, required: true },
    password: { type: String, required: true },
    socialId: { type: String, default: null },
    avatar:  { type: String, default:  DEFAULT_AVATAR},
    _root: { type: Schema.Types.ObjectId, ref: 'CategorySchema', required: true }
});

UserSchema.pre('save', function(next) {
	const user = this;

	if (!user.avatar) {
		user.avatar = DEFAULT_AVATAR;
	}

	bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    if (err) 
    	return next(err);
    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) return next(err);
      
      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.validatePassword = function(password, callback) {
  bcrypt.compare(password, this.password, (err, isMatch) => {
      if (err) 
      	return callback(err);
      callback(null, isMatch);
  });
};

var UserModel = Mongoose.model('user', UserSchema);

module.exports = UserModel;