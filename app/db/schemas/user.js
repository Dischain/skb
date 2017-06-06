'use strict';

const Mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

const SALT_WORK_FACTOR = 12;
const DEFAULT_AVATAR = '';

const UserSchema = new Mongoose.Schema({
	username: { type: String, unique: true, required: true, trim: true },
	email: { type: String, unique: true, trim: true },
    password: { type: String, required: true },
    socialId: { type: String, default: null },
    avatar:  { type: String, default:  DEFAULT_USER_PICTURE},
    _root: { type: Schema.Types.ObjectId, ref: 'CategorySchema', required: true }
});

UserSchema.pre('save', (next) => {
	const user = this;

	if (!user.avatar) {
		user.avatar = DEFAULT_AVATAR;
	}

	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) 
    	return next(err);

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) 
      	return next(err);

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

var userModel = Mongoose.model('user', UserSchema);

module.exports = userModel;