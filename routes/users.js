const express = require("express");

const {
  getUser,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/users");
const advancedResults = require("../middleware/advancedResults");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");
const { route } = require("./courses");

const router = express.Router();

//use middleware to protect, authorize
router.use(protect);
router.use(authorize("admin"));
router.route("/").get(advancedResults(User), getUsers).post(createUser);

router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

//You can also write this is also right
// router
//   .route("/")
//   .get(protect, authorize("admin"), advancedResults(User), getUsers)
//   .post(protect, authorize("admin"), createUser);

// router
//   .route("/:id")
//   .get(protect, authorize("admin"), getUser)
//   .put(protect, authorize("admin"), updateUser)
//   .delete(protect, authorize("admin"), deleteUser);

module.exports = router;
