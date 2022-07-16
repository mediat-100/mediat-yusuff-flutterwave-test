const mongoose = require("mongoose");

const splitBreakdownSchema = new mongoose.Schema({
    SplitId: {
        type: mongoose.Schema.ObjectId,
        ref: 'SplitInfo'
    },
	ID: {
		type: Number,
        unique: true,
        min: 1
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
