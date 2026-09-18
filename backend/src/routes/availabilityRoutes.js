const router = require("express").Router();

const { protect, authorize } = require("../middleware/authMiddleware");

const controller = require("../controllers/availabilityController");

// Current provider's own availability
// IMPORTANT: /me must come BEFORE /:providerId
router.get("/me", protect, authorize("provider"), controller.listAvailability);

// Public availability for a specific provider
router.get("/:providerId", controller.listAvailability);

// Provider creates/updates their availability
router.post("/", protect, authorize("provider"), controller.upsertAvailability);

module.exports = router;
