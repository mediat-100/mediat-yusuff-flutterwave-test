const express = require("express");
const splitController = require("../controllers/splitController");
const router = express.Router();

router.route("/splitpayments/compute").post(splitController.splitHandler);

module.exports = router;
