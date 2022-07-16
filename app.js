const express = require("express");

const splitRouter = require("./routes/splitRoute");
const app = express();

app.use(express.json());

// route
app.use("/", splitRouter);

// default route
app.use("/", (req, res) => {
	res.status(200).json({
		msg: "welcome to Mediat's Yusuff TPPS service",
	});
});

module.exports = app;