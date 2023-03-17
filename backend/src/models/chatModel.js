const mongoose = require("mongoose");

const { Schema } = mongoose;

const chatSchema = new Schema(
	{
		message: {
			type: String,
			required: true,
			trim: true,
		},
		isBot: {
			type: Boolean,
			required: true,
		},
		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
	},
	{ timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;