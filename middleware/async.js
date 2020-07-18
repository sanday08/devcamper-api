const router = require("../routes/bootcamps");

//This middleware use to handle try catch block
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
module.exports = asyncHandler;
