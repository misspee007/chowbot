// require("dotenv").config();
const mongoose = require("mongoose");
const { MenuModel } = require("../models");
const config = require("../config");

mongoose
	.connect(config.MONGODB_URI)
	.then(() => {
		console.log("Connected to database");
	})
	.catch((error) => {
		console.log(`connection string: ${config.MONGODB_URI}`);
		console.log(`port: ${config.PORT}`);
		console.log("Error connecting to database", error);
		throw new Error(error);
	});

async function seedDB() {
	try {
		const menuItems = [
			{
				name: "Jollof Rice",
				price: 800,
			},
			{
				name: "Fried Rice",
				price: 1000,
			},
			{
				name: "Salad",
				price: 500,
			},
			{
				name: "Fries",
				price: 300,
			},
			{
				name: "Chicken Wings",
				price: 600,
			},
			{
				name: "Coke",
				price: 200,
			},
			{
				name: "Zobo",
				price: 500,
			},
		];

		await MenuModel.insertMany(menuItems);

		console.log("Seeded DB!");
	} catch (error) {
		console.log(error);
	}
}

seedDB().then(() => {
	mongoose.connection.close();
});
