const SplitInfo = require("../models/splitInfo");
const SplitBreakdown = require("../models/splitBreakdown");

exports.splitHandler = async (req, res) => {
	try {
		// check if splifInfo exist
		const existingSplitInfo = await SplitInfo.findOne({ ID: req.body.ID });

		if (existingSplitInfo) throw new Error("Split Info already exist");

		// if splitInfo does not exist, save to DB
		const newSplitInfo = await SplitInfo.create(req.body);

		// get splitInfo from DB
		let initialBalance = req.body.Amount;
		const splitInfoArray = newSplitInfo.SplitInfo;

		// split process for FLAT
		const flatAmount = splitInfoArray
			.filter((el) => el.SplitType === "FLAT")
			.map((el) => {
				return { SplitEntityId: el.SplitEntityId, SplitValue: el.SplitValue };
			});

		flatAmount.forEach((el) => {
			initialBalance -= el.SplitValue;
		});

		// split process for PERCENTAGE
		const percAmount = splitInfoArray
			.filter((el) => el.SplitType === "PERCENTAGE")
			.map((el) => {
				const amount = (el.SplitValue / 100) * initialBalance;
				initialBalance = initialBalance - amount;

				return { SplitEntityId: el.SplitEntityId, SplitValue: amount };
			});

		// split process for RATIO
		const ratioArray = splitInfoArray.filter((el) => el.SplitType === "RATIO");

		let sum = 0;
		ratioArray.forEach((el) => {
			sum += el.SplitValue;
		});

		const openingRatioBalance = initialBalance;

		const ratioAmount = ratioArray.map((el) => {
			const amount = (el.SplitValue / sum) * openingRatioBalance;

			return { SplitEntityId: el.SplitEntityId, SplitValue: amount };
		});

		// array of all split process
		const splitBreakdown = [...flatAmount, ...percAmount, ...ratioAmount];

		let totalProcessingFee = 0;
		splitBreakdown.forEach((el) => {
			totalProcessingFee += el.SplitValue;
		});

		// Total balance after the split process
		const Balance = newSplitInfo.Amount - totalProcessingFee;

		// save splitBreakdown to DB
		const processingFeeToDB = await SplitBreakdown.create({
			SplitId: newSplitInfo._id,
			ID: newSplitInfo.ID,
			Balance: Balance,
			SplitBreakdown: splitBreakdown,
		});

		res.status(200).json({
			ID: processingFeeToDB.ID,
			Balance: processingFeeToDB.Balance,
			SplitBreakdown: processingFeeToDB.SplitBreakdown,
		});
	} catch (err) {
		console.log("error", err);
		res.status(400).json({
			message: err.message,
			error: err,
		});
	}
};
