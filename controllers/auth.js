const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

//@desc    Register a User
//@route   Post /api/v1/auth
//@access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, role, password } = req.body;
  //Create User
  const user = await User.create({ name, email, role, password });
  //Create Token
  //   const token = user.getSignedJwtToken();
  //   res.status(200).json({ success: true, token });
  sendTokenResponse(user, 200, res);
});

//@desc     Login user
//@route    Post /api/v1/auth/login
//@access   public

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  //email and password fields are required
  if (!email && !password) {
    return next(
      new ErrorResponse("Email and password fields must be required"),
      400
    );
  }
  //Check for user
  const user = await User.findOne({ email }).select("+password");
  console.log(user);
  if (!user) {
    return next(new ErrorResponse("Invalide credentials", 401));
  }
  //Check if Password matches
  const isMatch = await user.matchPassword(password);
  console.log(isMatch);
  if (!isMatch) {
    return next(new ErrorResponse("Invalide credentials", 401));
  }
  //Create Token
  //   const token = user.getSignedJwtToken();
  //   res.status(200).json({ success: true, token });

  sendTokenResponse(user, 200, res);
});

///@desc    Log user out/ clear cookie
//@route    GET /api/v1/auth/logout
//@access   Private

exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ success: true, data: {} });
});

///@desc     Get current logged in user
//@route    GET /api/v1/auth/me
//@access   private

exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, data: user });
});

///@desc     Update user details
//@route    PUT /api/v1/auth/updatedetails
//@access   private

exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };
  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: user });
});

///@desc     Update Password
//@route    PUT /api/v1/auth/updatepassword
//@access   private

exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  //Check current password (matchPassword method defined in User models)
  if (!(await user.matchPassword(req.body.currentPassword))) {
    next(new ErrorResponse(`Password is incorrect`, 401));
  }
  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

///@desc    Forget password
//@route    Post /api/v1/auth/forgetpassword
//@access   public

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorResponse(`There is no user with that email`, 404));
  }
  //Get reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  //Create reset url
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetpassword/${resetToken}`;
  const message = `You are receiving a email because you (or someone else) has requested the reset of a password. 
  Please make put reqest to:\n\n ${resetUrl}`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Token",
      message,
    });
    res.status(200).json({ success: true, data: "Email Sent" });
  } catch (error) {
    console.log(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse(`Email could not be sent`, 500));
  }

  res.status(200).json({ success: true, data: user });
});

///@desc     Reset Password
//@route    PUT /api/v1/auth/resetpassword/:resettoken
//@access   public

exports.resetPassword = asyncHandler(async (req, res, next) => {
  //Get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ErrorResponse("Invalide Token", 400));
  }
  //Set new Password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendTokenResponse(user, 200, res);
});

//Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  //Create Token
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token });
};
