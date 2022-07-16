const SplitInfo = require("../models/splitInfo");
const SplitBreakdown = require("../models/splitBreakdown");

exports.createTransaction = async (req, res) => {
	try {
		const transaction = await SplitInfo.create(req.body);
		// console.log("lengthSplit", transaction.splitInfo.length);
		res.status(200).json({
			transaction,
		});
	} catch (err) {
		console.log("error", err);
		res.status(500).json({
			error: err,
		});
	}
};

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

		let sum = 0;

		const ratioArray = splitInfoArray.filter((el) => el.SplitType === "RATIO");

		ratioArray.forEach((el) => {
			sum += el.SplitValue;
		});

		// split process for RATIO
		const openingRatioBalance = initialBalance;

		const ratioAmount = ratioArray.map((el) => {
			const amount = (el.SplitValue / sum) * openingRatioBalance;

			return { SplitEntityId: el.SplitEntityId, SplitValue: amount };
		});

		const splitBreakdown = [...flatAmount, ...percAmount, ...ratioAmount];

		let totalProcessingFee = 0;
		splitBreakdown.forEach((el) => {
			totalProcessingFee += el.SplitValue;
		});

		const Balance = newSplitInfo.Amount - totalProcessingFee;

		// console.log(initialBalance);
		// console.log("totalProcessingFee", totalProcessingFee);
		// console.log("Balance", Balance);

		const processingFeeToDB = await SplitBreakdown.create({
			ID: newSplitInfo.ID,
			Balance: Balance,
			SplitBreakdown: splitBreakdown,
		});

		res.status(200).json({
			processingFeeToDB,
		});
	} catch (err) {
		console.log("error", err);
		res.status(400).json({
			message: err.message,
			error: err,
		});
	}
};
