const asyncHandler = require("../middleware/async");
const ErrorRespose = require("../utils/errorResponse");
const User = require("../models/User");

//@desc      Get all users
//@routes    GET /api/v1/auth/users
//Access     Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

//@desc      Get Single users
//@routes    GET /api/v1/auth/users/:id
//Access     Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  res.status(200).json({ success: true, data: user });
});

//@desc      Create users
//@routes    Post /api/v1/auth/users
//Access     Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);
  res.status(200).json({ success: true, data: user });
});

//@desc      Update users
//@routes    PUT /api/v1/auth/users/:id
//Access     Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: user });
});

//@desc      Delete users
//@routes    DELETE /api/v1/auth/users/:id
//Access     Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  await User.findOneAndDelete(req.params.id);
  res.status(200).json({ success: true, data: {} });
});
