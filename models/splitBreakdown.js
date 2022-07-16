const mongoose = require("mongoose");

const splitBreakdownSchema = new mongoose.Schema({
	ID: {
		type: Number
	},
	Balance: {
		type: Number,
		min: [0, "Balance cannot be less than 0"],
	},
	SplitBreakdown: {
		type: [{}],
	},
});

const SplitBreakdown = mongoose.model("SplitBreakdown", splitBreakdownSchema);

module.exports = SplitBreakdown;
