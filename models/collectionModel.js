// jshint esversion:9
const mongoose = require('mongoose');
const validator = require('validator');

const toObjAndJSONOptions = {
  getters: true,
  virtuals: true,
  aliases: false,
  versionKey: true
};

var collectionSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now()
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Collection "user" field must reference a user']
  },
  // use word ids to populate on client side using all words to
  // reduce database queries
  words: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Word',
    required: [true, 'Collection "word" must reference a word']
  }],
}, {
  toJSON: toObjAndJSONOptions,
  toObject: toObjAndJSONOptions,
  id: false
});






























// EOF
