const express = require("express");

const {
  getBootcamp,
  getBootcamps,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload,
} = require("../controllers/bootcamps");
const { protect, authorize } = require("../middleware/auth");
const Bootcamp = require("../models/Bootcamp");
const advancedResults = require("../middleware/advancedResults");

//Include other resource routers
const courseRouter = require("./courses");
const reviewRouter = require("./reviews");
const router = express.Router();

router
  .route("/")
  .get(
    advancedResults(Bootcamp, {
      path: "courses",
      select: "title description tution",
    }),
    getBootcamps
  )
  .post(protect, authorize("publisher", "admin"), createBootcamp);
router
  .route("/:id")
  .get(getBootcamp)
  .put(protect, authorize("publisher", "admin"), updateBootcamp)
  .delete(protect, authorize("publisher", "admin"), deleteBootcamp);

//Re-route into  other resource routers
router.use("/:bootcampId/courses", courseRouter);
router.use("/:bootcampId/reviews", reviewRouter);

//Image uploader
router
  .route("/:id/photo")
  .put(protect, authorize("publisher", "admin"), bootcampPhotoUpload);

router.route("/:radius/:zipcode/:distance").get(getBootcampsInRadius);

module.exports = router;
