const mongoose = require("mongoose");
const validator = require("validator");

function arrayLimit(val) {
	return val.length >= 1 && val.length <= 20;
}

const splitInfoSchema = new mongoose.Schema({
	ID: { type: Number, unique: true, min: 1 },
	Amount: Number,
	Balance: {
		type: Number,
		min: [0.01, "Balance must be greater than zero"],
	},
	Currency: {
		type: String,
		default: "NGN",
	},
	CustomerEmail: {
		type: String,
		unique: true,
		validate: [validator.isEmail, "Please provide a valid email address"],
	},
	SplitInfo: {
		type: [
			{
				SplitType: {
					type: String,
					enum: ["FLAT", "RATIO", "PERCENTAGE"],
				},
				SplitValue: {
					type: Number,
					min: [0, "Split value must be at least 0"],
				},
				SplitEntityId: {
					type: String,
					unique: true,
				},
			},
		],
		validate: [arrayLimit, "Limit is between is 1 and 20"],
		_id: false,
	},
});

const SplitInfo = mongoose.model("SplitInfo", splitInfoSchema);

module.exports = SplitInfo;
