require("dotenv").config();
const http = require("http");
const express = require("express");
const mongoose = require("mongoose");
const splitRouter = require("./routes/splitRoute");
const app = express();

const server = http.createServer(app);

app.use(express.json());
app.use("/api/v1/lannister-pay", splitRouter);

// db connection
mongoose
	.connect(process.env.DB, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		console.log("DB connected successfully...");
	})
	.catch((err) => {
		console.log("DB connection failed!!!", err);
	});

const port = process.env.PORT || 3000;

server.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
