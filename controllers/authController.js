// jshint esversion: 9
const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
// const sendEmail = require('./../utils/email');
const User = require('./../models/userModel');

const signToken = (id, expire) => {
  const token = jwt.sign({
    id
  }, process.env.JWT_SECRET, {
    expiresIn: expire
  });
  return token;
};

const createResponse = (data, res, statusCode, user_id) => {
  let jsonObj;

  // create jwt
  const token = signToken(user_id, process.env.JWT_EXPIRE);

  // create cookie options
  let cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  // activate secure cookie in production
  // if(process.env.NODE_ENV === 'production')
  //   cookieOptions.secure = true;

  // send token as http only cookie
  res.cookie('scw', token, cookieOptions);

  // create json reponse Object
  jsonObj = {
    status: 'success',
  };

  // add data to json object if it exists
  if(data)
    jsonObj.data = data;

  res.status(statusCode).json(jsonObj);
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    fname: req.body.fname,
    lname: req.body.lname,
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });

  createResponse({user: newUser}, res, 201, newUser._id);
});

exports.login = catchAsync(async (req, res, next) => {
  console.log('%s\x1b[31m%s\x1b[0', 'In ', 'login');
  const {
    _user,
    password
  } = req.body;
  let filter;

  // 1) CHECK IF EMAIL AND PASSWORD EXIST
  if (!_user || !password)
    throw new AppError('Please provide email and password.', 400);

  // 2) CHECK IF USER INPUT IS USERNAME OR EMAIL
  if(validator.isEmail(_user))
    filter = {email: _user};
  else
    filter = {username: _user};

  // 3) CHECK IF USER EXISTS AND PASSWORD IS CORRECT
  const user = await User.findOne(filter).select('+password');
  const passwordIsValid = user ? await user.passwordCheck(password, user.password) : null;

  if (!user || !passwordIsValid) {
    throw new AppError('Incorrect email or password.', 401);
  }

  // 4) IF EVERTHING IS OK, SEND TOKEN TO CLIENT
  createResponse(null, res, 200, user._id);
});

exports.logout = (req, res) => {
  res.cookie(
    'scw',
    signToken(req.user._id, 0),
    {
      expires: new Date(Date.now() * 10 * 1000),
      httpOnly: true
    }
  );
  res.status(200).json({ status: 'success' });
};

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.scw) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.scw,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.JWTtimestampBeforePasswordChange(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
    } catch(err) {
      // do nothing
    }
  }
  next();
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) GET TOKEN AND CHECK IF IT EXISTS
  let token;
  if(req.cookies.scw)
    token = req.cookies.scw;
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];
  if (!token)
    throw new AppError('Please login to access this route.', 401);

  // 2) VERIFY TOKEN USING SERVER SECRET
  const decodedJWT = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) CHECK IF USER STILL EXITS
  const user = await User.findById(decodedJWT.id);
  if (!user)
    throw new AppError('User of token no longer exists.', 401);

  // 4) CHECK IF USER CHANGED PASSWORD AFTER THE JWT WAS ISSUED
  if (user.JWTtimestampBeforePasswordChange(decodedJWT.iat)) {
    throw new AppError('User recently changed password! Please login again.', 401);
  }

  // GRANT ACCESS TO USER
  req.user = user;

  next();
});

exports.restrictTo = (...roles) => {
  return catchAsync(async (req, res, next) => {
    if (!roles.includes(req.user.role))
      throw new AppError('Permission denied.', 403);
    next();
  });
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) GET USER BASED ON 'POST'ED EMAIL
  const user = await User.findOne({
    email: req.body.email
  });
  if (!user)
    // this error should not be displayed to the user. Instead, display:
    // 'If this email exists for a user, it will recieve a link to reset
    //  your password'
    throw new AppError('No user found for email given', 404);
  // 2) GENERATE RANDOM RESET TOKEN
  const resetToken = user.createPasswordRestToken();
  await user.save({
    validateBeforeSave: false
  });

  // 3) SEND RESET LINK WITH RESET TOKEN TO USER EMAIL
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Reset your password using this link:\n${resetURL}\nIf you did not request to reset your password, please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Link (Valid for 10 Minutes)',
      message
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({
      validateBeforeSave: false
    });

    throw new AppError('There was an error sending the reset email. Try again later!', 500);
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) GET USER BASED ON TOKEN
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // IF TOKEN HAS NOT EXPIRED AND USER EXITS, SET NEW PASSWORD
  if (!user)
    throw new AppError('Token is invalid or has expired', 400);

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordRestToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) LOG USER IN, SEND JWT
  createResponse(null, res, 200, user._id);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) GET USER FROM COLLECTION
  const user = await User.findById(req.user._id).select('+password');

  // 2) CHECK IF 'POST'ED PASSWORD IS CORRECT
  const passwordCheck = await user.passwordCheck(req.body.password, user.password);
  if(!passwordCheck)
    throw new AppError('Current password verification failed', 401);

  // 3) UPDATE PASSWORD
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;
  await user.save();

  // 4) LOG USER IN, SEND JWT
  createResponse(null, res, 200, user._id);
});






















// EOF
