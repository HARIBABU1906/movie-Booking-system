const express = require("express");
const {
  createShow,
  createTheater,
  getOwnerShows,
  getShows,
  getTheaters,
  getShowAvailability,
} = require("../controllers/theaterController");
const { authorize, protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getTheaters);
router.post("/", protect, authorize("admin", "owner"), createTheater);

router.get("/shows", getShows);
router.post("/shows", protect, authorize("admin", "owner"), createShow);
router.get("/shows/:id/seats", getShowAvailability);

router.get("/owner/shows", protect, authorize("owner"), getOwnerShows);

module.exports = router;
