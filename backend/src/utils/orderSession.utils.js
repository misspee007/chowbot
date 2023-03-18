const { MenuModel } = require("../models");

function parseOrderHistory(orders) {
	let msg = `Chowbot: Here's your order history:

  `;

	orders.forEach((order) => {
		msg += `Date: ${order.date}
    Order ID: ${order.id}
    Status: ${order.status}
    `;

		order.items.forEach((item, index) => {
			msg += `${index + 1}. ${item.name} - ₦${item.price} x ${item.qty}
      `;
		});

		msg += `Total: ₦${order.total}

    `;
	});

	return msg;
}

function parseOrder(order) {
	let msg = `Chowbot: Here's your pending order:

  `;

	order.forEach((item, index) => {
		msg += `${index + 1}. ${item.name} - ₦${item.price} x ${item.qty}
    `;
	});

	msg += `Total: ₦${order.reduce((acc, item) => acc + item.price * item.qty, 0)}
  `;
	msg += `0. Go back to main menu`;
	return msg;
}

async function getMenu() {
	try {
		const menu = await MenuModel.find();
		return menu;
	} catch (err) {
		console.log("Error getting menu: ", err);
		throw new Error(err);
	}
}

const ORDER_STATUS = {
	PENDING: "pending",
	CONFIRMED: "confirmed",
	CANCELLED: "cancelled",
	NONE: "none",
};

class OrderingSessionEvent {
	constructor({ data, eventName, message, isBot }) {
		this.data = data;
		this.eventName = eventName;
		this.message = message;
		this.isBot = isBot;
	}
}

module.exports = {
	parseOrderHistory,
	parseOrder,
	getMenu,
	ORDER_STATUS,
	OrderingSessionEvent,
};
