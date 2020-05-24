// jshint esversion: 9
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');

// SCHEMA OPTIONS
const toObjAndJSONOptions = {
  getters: true,
  virtuals: true,
  aliases: false,
  versionKey: true
};

// SCHEMA
const userSchema = new mongoose.Schema({
  fname: {
    type: String,
    required: [true, 'Please enter your name'],
    trim: true,
    maxlength: [30, 'first name length must be less than 30 characters'],
    minlength: [1, 'first name must not be empty']
  },
  lname: {
    type: String,
    required: [true, 'Please enter your name'],
    trim: true,
    maxlength: [30, 'last name length must be less than 30 characters'],
    minlength: [1, 'last name must not be empty']
  },
  username: {
    type: String,
    required: [true, 'Please enter your name'],
    trim: true,
    unique: true,
    maxlength: [15, 'Username length must be 15 characters or less'],
    minlength: [1, 'Username must not be empty']
  },
  email: {
    type: String,
    required: [true, 'Please enter an email'],
    lowercase: true,
    trim: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: 'Please enter a valid email (example@domain.com)'
    },
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minlength: [8, 'Passwords must be 8 or more characters'],
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function(val) {
        return this.password === val;
      },
      message: 'Password confirmation failed'
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  }
}, {
  toJSON: toObjAndJSONOptions,
  toObject: toObjAndJSONOptions,
  id: false
});

// VIRTUAL PROPERTIES


// HOOKS
userSchema.pre(/^find/, async function(next) {
  this.find({active: {$ne: false}});
  next();
});

userSchema.pre('save', async function(next) {
  if(!this.isModified('password'))
    return next();

  if(!this.isNew){
    this.passwordChangedAt = Date.now() - 1000;
    if(this.passwordResetToken)
      this.passwordResetToken = undefined;
  }

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

// delete sensitive fields to prevent data from being transmitted in response
userSchema.post('save', async function(doc, next) {
  doc.password = undefined;
  doc.active = undefined;
  doc.role = undefined;
  next();
});

userSchema.methods.passwordCheck = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.JWTtimestampBeforePasswordChange = function (JWTTimestamp) {
  if (this.passwordChangedAt)
    return (this.passwordChangedAt.getTime() / 1000) > JWTTimestamp;
  return false;
};

userSchema.methods.createPasswordRestToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 *60 * 1000;
  return resetToken;
};

module.exports = mongoose.model('User', userSchema);

























// EOF
