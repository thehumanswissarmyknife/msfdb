const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

var Schema = mongoose.Schema;

var userSchema = new Schema ({
	username: {
		type: String,
		trim: true,
		unique: true
	},
	email: {
		type: String,
		required: true,
		trim: true,
		minlength: 7,
		unique: true,
		validate: {
			validator: validator.isEmail,
			message: "{VALUE} is not a valid email"
		}
	},
	password: {
		type: String,
		require: true,
		minlength: 8
	},
	tokens: [{
		access: {
			type: String,
			require: true
		},
		token: {
			type: String,
			require: true
		}
	}],
	level: String
});

userSchema.methods.generateAuthToken = function () {
	var user = this;
	var access = "auth";
	var token = jwt.sign({_id: user._id.toHexString(), access}, "myDirtySecret").toString();

	user.tokens.push({access, token});

	return user.save().then(() => {
		return token;
	});
};

userSchema.methods.toJSON = function () {
	var user = this;
	var userObject = user.toObject();

	return _.pick(userObject, ['_id', 'email']);

}

var User = mongoose.model('User', userSchema);

module.exports = {User};