require("dotenv").config();
const http = require("http");
const mongoose = require("mongoose");
const app = require("./app.js");

const server = http.createServer(app);

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
