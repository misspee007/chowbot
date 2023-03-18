// require("dotenv").config();
const mongoose = require("mongoose");
const { MenuModel, ChatModel, UserModel } = require("../models");
const { menuItems } = require("../utils/constants.utils");
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
    // Delete all existing documents
    const dbUsers = await UserModel.find({});
    const dbChats = await ChatModel.find({});
    const dbMenus = await MenuModel.find({});

    const userIds = dbUsers.map((user) => user._id.toString());
    const chatIds = dbChats.map((chat) => chat._id.toString());
    const menuIds = dbMenus.map((menu) => menu._id.toString());

    await UserModel.deleteMany({ _id: { $in: userIds } });
    await ChatModel.deleteMany({ _id: { $in: chatIds } });
    await MenuModel.deleteMany({ _id: { $in: menuIds } });

    // clear connect-mongo collection
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const connectMongoCollection = collections.find(
      (collection) => collection.name === "sessions"
    );
    if (connectMongoCollection) {
      await db.dropCollection("sessions");
    }

    console.log("Database cleared");

    // Seed the database
		await MenuModel.insertMany(menuItems);

		console.log("Seeded DB!");
	} catch (error) {
		console.log(error);
	}
}

seedDB().then(() => {
	mongoose.connection.close();
});
