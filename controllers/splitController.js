const SplitInfo = require("../models/splitInfo");
const SplitBreakdown = require("../models/splitBreakdown");

exports.splitHandler = async (req, res) => {
	try {
		// check if splitValue is not greater than amount
		const SplitInfoArray = req.body.SplitInfo;

		SplitInfoArray.filter((el) => {
			if (el.SplitValue > req.body.Amount)
				throw new Error("SplitValue cannot be greater than amount");
		});

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
				return { SplitEntityId: el.SplitEntityId, Amount: el.SplitValue };
			});

		flatAmount.forEach((el) => {
			initialBalance -= el.Amount;
		});

		// split process for PERCENTAGE
		const percAmount = splitInfoArray
			.filter((el) => el.SplitType === "PERCENTAGE")
			.map((el) => {
				const amount = (el.SplitValue / 100) * initialBalance;
				initialBalance = initialBalance - amount;

				return { SplitEntityId: el.SplitEntityId, Amount: amount };
			});

		// split process for RATIO
		const ratioArray = splitInfoArray.filter((el) => el.SplitType === "RATIO");

		let ratioSum = 0;
		ratioArray.forEach((el) => {
			ratioSum += el.SplitValue;
		});

		const openingRatioBalance = initialBalance;

		const ratioAmount = ratioArray.map((el) => {
			const amount = (el.SplitValue / ratioSum) * openingRatioBalance;

			return { SplitEntityId: el.SplitEntityId, Amount: amount };
		});

		// array of all split process
		const splitBreakdown = [...flatAmount, ...percAmount, ...ratioAmount];

		let totalProcessingFee = 0;
		splitBreakdown.forEach((el) => {
			totalProcessingFee += el.Amount;
		});

		// check if sum of split values greater than amount
		if (totalProcessingFee > req.body.Amount)
			throw new Error(
				"The sum of all split Amount values computed cannot be greated than the Amounnt"
			);

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
