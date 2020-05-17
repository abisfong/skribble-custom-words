// jshint esversion: 9
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const Word = require('./../models/wordModel');

exports.getHomepage = catchAsync( async (req, res, next) => {
  let dupKey;

  if(res.duplicateKeyFound) {
    dupKey = req.body.word;
    console.log(dupKey);
  }

  res.status(200).render('homepage', {
    words: res.words,
    ...dupKey && {dupKey}
  });
});

exports.getLogin = catchAsync( async (req, res, next) => {
  res.status(200).render('login');
});

exports.getSignup = catchAsync( async (req, res, next) => {
  res.status(200).render('signup');
});

exports.getAccount = catchAsync(async (req, res, next) => {
  res.status(200).render('account', {
    words: res.words,
  });
});























// EOF
