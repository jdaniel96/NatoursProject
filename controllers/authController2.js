const { promisify } = require('util');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  }); //in mongo the
};

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      role: req.body.role,
    });

    const token = signToken(newUser._id);
    res.cookie('jwt', token, {
      expiresIn: new Date(+Date.now() * 90 * 24 * 60 * 60 * 1000),
      // secure: true,
      httpOnly: true,
    });

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    console.error(err);
  }

  next();
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // console.log(email, password);

    //1 check if email and password exist
    if (!email || !password) {
      return next(new Error('buenooooo main algo malo con el login', 400));
    }

    //2 check if user exist and if password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new Error('password or email is incorrect', 401));
    }

    // console.log(user);
    //3 If everything is ok and send token to client
    const token = signToken(user._id);

    res.cookie('jwt', token, {
      expiresIn: new Date(+Date.now() * 90 * 24 * 60 * 60 * 1000),
      // secure: true,
      httpOnly: true,
    });
    res.status(200).json({
      status: 'all good my nigga',
      token,
    });
  } catch (err) {
    next(new Error('something is wrong in the auth controller login', 400));
  }
};

exports.protect = async (req, res, next) => {
  //1 getting the token and check if it exist

  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
      // console.log(token);
    }

    if (!token) {
      next(new Error('there is no token, you are not logged', 401));
    }

    //2 verification de token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // console.log(`the decoded is ${JSON.stringify(decoded)}`);

    //3 check if user still exists
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
      next(new Error('the user does not exist anymore '));
    }

    //4 check if user changed password after the JWT(token) was issued
    if (freshUser.changedPasswordAfter(decoded.iat)) {
      return next(new Error('recently changed password'));
    }
    // 5 grant access to protected route

    req.user = freshUser;

    next();
  } catch (err) {
    console.log(err);
    next(new Error('something wrong with the "protect" function'), 401);
  }
};
//info can be passed from middleware to middleware that's why I can use the user variables below
exports.restrictTo = (...roles) => {
  //restricting users depending on their roles jaja omg so cool
  return (req, res, next) => {
    try {
      if (!roles.includes(req.user.role)) return;
    } catch (err) {
      next(new Error('you do not have permission to do this operation'), 403);
    }
    next();
  };
};

exports.forgotPassword = async (req, res, next) => {
  //1 get user based on posted email
  // try {
  const user = await User.findOne({ email: req.body.email });
  if (!user) next(console.log('no user'));

  //2 generate random token
  try {
    const resetToken = user.createPasswordResetToken();
    // console.log(resetToken);
    await user.save({ validateBeforeSave: false });

    //3 send email to user
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your pass? reset it ma nigga omg jaja here: ${resetUrl}`;

    await sendEmail({
      email: user.email,
      subject: 'reset your password jaja omg',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'password reset good',
    });
  } catch (err) {
    (user.createPasswordResetToken = undefined),
      (user.passwordResetExpires = undefined);
    await user.save({ validateBeforeSave: false });
    next(new Error(err), 404);
  }
};

exports.resetPassword = async (req, res, next) => {
  //1 get user based on the token

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //2 if token has not expired and there is a user, in the case set a new password
  if (!user) {
    return next(new Error('token is invalid or has expired'), 404);
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  //3 update the changed passowrd property for the user

  //4Log the user in, send JWT
  const token = signToken(user._id);
  res.cookie('jwtdaniel', token, {
    expiresIn: new Date(+Date.now() * 90 * 24 * 60 * 60 * 1000),
    // secure: true,
    httpOnly: true,
  });
  // console.log(token);
  // console.log(`Este es el user id ${user._id}`);

  res.status(200).json({
    status: 'all good my nigga',
    token,
  });
};

exports.updatePassword = async (req, res, next) => {
  //1 get the user form the collection (database)
  try {
    const user = await User.findById(req.user.id).select('+password');
    //2 if the posted password if correct
    if (
      !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
      // console.log(req.body.passwordCurrent, user.password);
      return next(new Error('your current password is wrong'), 401);
    }
    //3 if the password is correct, update the password

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    //4 log in the user and give him the token again

    const token = signToken(user._id);
    // console.log(token);
    // console.log(`Este es el user id ${user._id}`);
    res.cookie('jwtdaniel', token, {
      expiresIn: new Date(+Date.now() * 90 * 24 * 60 * 60 * 1000),
      // secure: true,
      httpOnly: true,
    });

    res.status(200).json({
      status: 'all good my nigga',
      token,
    });
  } catch (err) {
    console.log(err);
  }
  next();
};
