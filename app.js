const express = require("express");

const splitRouter = require("./routes/splitRoute");
const app = express();

app.use(express.json());

// route
app.use("/api/v1/lannister-pay", splitRouter);

// default route
app.use("/", (req, res, next) => {
	res.status(200).json({
		msg: "welcome to TPPS service",
	});
});

module.exports = app;