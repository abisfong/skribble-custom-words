// jshint esversion: 8
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/userModel');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
  const filteredObj = {};
  Object.keys(obj).forEach(el => {
    if(allowedFields.includes(el))
      filteredObj[el] = obj[el];
  });
  return filteredObj;
};

exports.createUser = factory.createOne(User);
exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) CREATE ERROR IF USER POSTS PASSWORD DATA
  if (req.body.password || req.body.passwordConfirm)
    throw new AppError('Invalid password change request', 400);

  // 2) FILTER OUT FIELD NAMES NOT ALLOWED
  const filteredBody = filterObj(
    req.body,
    'fname',
    'lname',
    'username',
    'email'
  );

  // 3) UPDATE USER DOCUMENT
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true, // makes function return new document instead of old
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.usernameIsTaken = catchAsync(async (req, res, next) => {
  const user = await User.findOne({username: req.body.username});
  res.status(200).json({
    status: 'success',
    usernameIsTaken: user? true : false
  });
});























// EOF
