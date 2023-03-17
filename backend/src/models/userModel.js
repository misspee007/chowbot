const mongoose = require("mongoose");

const { Schema } = mongoose;

const orderSchema = new Schema({
	status: {
		type: String,
		enum: ["pending", "confirmed", "cancelled"],
    required: true,
	},
  date: {
    type: String,
    required: true,
  },
	items: [
		{
			name: {
				type: String,
				required: true,
			},
			price: {
				type: Number,
				required: true,
			},
      qty: {
        type: Number,
        required: true,
      }
		},
	],
	total: Number,
});

const userSchema = new Schema(
	{
		userId: {
			type: String,
			required: true,
			unique: true,
		},
		orders: [orderSchema],
		chatHistory: [{ type: Schema.Types.ObjectId, ref: "Chat" }],
	},
	{ timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
