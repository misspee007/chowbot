const orderStatus = {
	PENDING: "pending",
	COMPLETED: "completed",
	CANCELLED: "cancelled",
};

const menu = [
	{
		name: "Hamburger",
		price: 800,
		options: ["beef", "chicken", "veggie"],
	},
	{
		name: "Pizza",
		price: 1000,
		options: ["pepperoni", "mushroom", "sausage"],
	},
	{
		name: "Salad",
		price: 500,
		options: ["caesar", "greek", "house"],
	},
];

class OrderingSessionEvent {
	constructor({ data, eventName, message }) {
		this.data = data;
		this.eventName = eventName;
		this.message = message;
	}
}

class UserData {
	constructor(socket) {
		this.socket = socket;
		this.orderStatus = socket.request.session.orderStatus || null;
		this.order = socket.request.session.order || [];
		this.orders = socket.request.session.orders || [];
	}

	setOrderStatus(orderStatus) {
		this.socket.request.session.orderStatus = orderStatus;
		this.socket.request.session.save();

		console.log(
			"order status after update: ",
			this.socket.request.session.orderStatus
		);
	}

	setOrder(item) {
		this.socket.request.session.order.push(item);
		this.socket.request.session.save();

		console.log("order after update: ", this.socket.request.session.order);
	}

	setOrders(orders) {
		this.socket.request.session.orders.push(orders);
		this.socket.request.session.save();

		console.log("orders after update: ", this.socket.request.session.orders);
	}

	resetOrder() {
		this.socket.request.session.orderStatus = null;
		this.socket.request.session.order = [];
		this.socket.request.session.save();

		console.log("session after reset: ", this.socket.request.session);
	}
}

class OrderingSession {
	constructor(socket) {
		this.socket = socket;
		this.userData = new UserData(socket);
		this.menu = menu;

		this.init("Welcome to Chowbot!");
	}

	init(heading) {
    const message = `${heading || ""}
    Please select an option:
    1. Place an order
    99. Proceed to checkout
    98. View order history
    97. View current order
    0. Cancel order
    `;

		this.emitOrderingEvent({
      message: message,
			eventName: "message",
		});

		this.socket.once("message", (message) => {
			this.handleMessage(message);
		});
	}

	handleMessage(message) {
		const selectedOption = Number(message);
		switch (selectedOption) {
			case 1:
				this.displayMenu("Please select an item:");
				break;
			case 99:
				this.checkout();
				break;
			case 98:
				this.showOrderHistory();
				break;
			case 97:
				this.showCurrentOrder();
				break;
			case 0:
				this.cancelOrder();
				break;
			default:
				this.emitOrderingEvent({
					message: "Invalid option. Please try again.",
					eventName: "message",
				});
				break;
		}
	}

	createOrderingEvent(event) {
		const newEvent = new OrderingSessionEvent(event);
		return newEvent;
	}

	emitEvent(event) {
		this.socket.emit(event.eventName, event);
	}

	emitOrderingEvent({ message, data, eventName }) {
		const newEvent = this.createOrderingEvent({ message, data, eventName });
		this.emitEvent(newEvent);
	}

	displayMenu(heading) {
    let message = `${heading || ""}

    `;
		this.menu.forEach((item, index) => {
      message += `${index + 1}. ${item.name} - ${item.price}
      `;
		});
    message += `0. Go to main menu`;
		this.emitOrderingEvent({
			message: message,
			eventName: "menu",
		});
		this.socket.once("menu", (option) => {
			this.handleMenuOption(option);
		});
	}

	handleMenuOption(option) {
		const selectedOption = Number(option);
		const item = this.menu[selectedOption - 1];

		if (item) {
			// if order is empty, set order status to pending
			if (this.userData.order.length === 0) {
				this.userData.orderStatus = orderStatus.PENDING;
			}

			// add item to order
			const orderItem = {
				name: item.name,
				price: item.price,
				qty: 1,
			};
			this.userData.setOrder(orderItem);
			console.log(
				"User Data after update: ",
				this.userData.orderStatus,
				this.userData.order,
				this.userData.orders
			);

			this.displayMenu(`${item.name} added to order. Please select another item from the menu:`);
		} else if (selectedOption === 0) {
			this.init();
		} else {
			this.emitOrderingEvent({
				message: "Invalid option. Please try again.",
				eventName: "message",
			});
		}
	}

	checkout() {
		// if order is empty, display error message, else proceed to checkout
		if (this.userData.orderStatus !== orderStatus.PENDING) {
      let message = `No order to place!
      Please select an option:
      1. Place an order
      98. View order history
      `;

			this.emitOrderingEvent({
				message: message,
				eventName: "message",
			});
			return;
		}

		this.handleOrder();
		this.init();
	}

	handleOrder() {
		const date = new Date();
		const order = {
			id: this.userData.orders.length + 1,
			status: orderStatus.COMPLETED,
			date: date.toDateString(),
			total: this.userData.order.reduce((prev, curr) => prev + curr.price, 0),
			items: this.userData.order,
		};
		this.userData.resetOrder();
		this.userData.setOrders(order);
		console.log(
			"User Data after update: ",
			this.userData.orderStatus,
			this.userData.order,
			this.userData.orders
		);

		this.emitOrderingEvent({
			message: "Order placed successfully!",
			eventName: "message",
		});
	}

	showOrderHistory() {
		this.emitOrderingEvent({
			eventName: "orders",
			data: this.userData.orders,
		});
		this.emitOrderingEvent({
			message: "0. Go back",
			eventName: "menu",
		});
		this.socket.once("menu", (option) => {
			this.handleMenuOption(option);
		});
	}

	showCurrentOrder() {
		if (this.userData.orderStatus !== orderStatus.PENDING) {
			this.init("No order in progress!");
			return;
		}

		this.emitOrderingEvent({
			eventName: "order",
			data: this.userData.order,
		});
		this.emitOrderingEvent({
			message: "0. Go back",
			eventName: "menu",
		});
		this.socket.once("menu", (option) => {
			this.handleMenuOption(option);
		});
	}

	cancelOrder() {
		if (this.userData.orderStatus !== orderStatus.PENDING) {
			this.init("No order in progress!");
			return;
		}

		const date = new Date();
		const order = {
			id: this.userData.orders.length + 1,
			status: orderStatus.CANCELLED,
			date: date.toDateString(),
			total: this.userData.order.reduce((prev, curr) => prev + curr.price, 0),
			items: this.userData.order,
		};
		this.userData.resetOrder();
		this.userData.setOrders(order);

		this.init("Order cancelled!");
	}
}

module.exports = OrderingSession;
