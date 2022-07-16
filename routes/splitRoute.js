const express = require("express");
const splitController = require("../controllers/splitController");
const router = express.Router();

router.route("/split-payments/compute").post(splitController.splitHandler);

module.exports = router;
