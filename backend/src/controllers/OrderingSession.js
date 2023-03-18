const { uuid } = require("uuidv4");
const { UserModel, ChatModel } = require("../models");
const { parseOrder, parseOrderHistory, getMenu, ORDER_STATUS, OrderingSessionEvent } = require("../utils/orderSession.utils");

class OrderingSession {
	constructor(socket) {
		this.socket = socket;
		getMenu().then((menu) => {
			this.menu = menu;
		});

		this.socket.request.session.active = true;
		this.saveSession();

		this.userId = this.socket.request.session.userId;
		this.user = null;
		this.chatHistory = [];

		if (!this.userId) {
			this.userId = uuid();
			this.socket.request.session.userId = this.userId;
			this.saveSession();

			this.createUser()
				.then((user) => {
					this.user = user;
					this.init("Hi! I'm Chowbot. How can I help you?");
				})
				.catch((err) => {
					console.log("Error creating user: ", err);
					throw new Error(err);
				});
		} else {
			this.findUser()
				.then((user) => {
					this.user = user;
					return this.getChatHistory();
				})
				.then((msgs) => {
					this.chatHistory = msgs;
					this.emitChatHistory(msgs);
					this.init("Welcome back! How can I help you?");
				})
				.catch((err) => {
					console.log("Error: ", err);
					throw new Error(err);
				});
		}
	}

	saveSession() {
		this.socket.request.session.save(function (err) {
			if (err) {
				console.log("Error saving session: ", err);
				throw new Error(err);
			}
		});
	}

	async createUser() {
		try {
			const newUser = await UserModel.create({
				userId: this.userId,
			});
			return newUser;
		} catch (err) {
			console.log("Error creating user: ", err);
			throw new Error(err);
		}
	}

	async findUser() {
		try {
			const oldUser = await UserModel.findOne({ userId: this.userId });
			return oldUser;
		} catch (err) {
			console.log("Error finding user: ", err);
			throw new Error(err);
		}
	}

	async getChatHistory() {
		const msgs = await ChatModel.find({ user: this.user._id });
		return msgs;
	}

	emitChatHistory(msgs) {
		msgs.forEach((chat) => {
			this.emitOrderingEvent({
				message: chat.message,
				eventName: "chatHistory",
				isBot: chat.isBot,
			});
		});
	}

	async saveMsg(message, isBot) {
		try {
			await ChatModel.create({
				message: message,
				isBot: isBot,
				user: this.user._id,
			});
		} catch (err) {
			console.log("Error saving chat history: ", err);
			throw new Error(err);
		}
	}

	createOrderingEvent(event) {
		const newEvent = new OrderingSessionEvent(event);
		return newEvent;
	}

	emitEvent(event) {
		this.socket.emit(event.eventName, event);
	}

	emitOrderingEvent({ message, data, eventName, isBot }) {
		const newEvent = this.createOrderingEvent({
			message,
			data,
			eventName,
			isBot,
		});
		this.emitEvent(newEvent);

		this.saveMsg(message, true)
			.then(() => {
				console.log("Saved chat history");
			})
			.catch((err) => {
				console.log("Error saving chat history: ", err);
				console.log("");
				throw new Error(err);
			});
	}

	init(heading) {
		const message = `Chowbot: ${heading || ""}

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
			isBot: true,
		});

		this.socket.once("message", (message) => {
			this.handleMessage(message);
		});
	}

	handleMessage(message) {
		if (!message || message.trim().length === 0) {
			console.log("Invalid message: ", message);
			this.emitOrderingEvent({
				message: "Chowbot: Invalid message. Please try again.",
				eventName: "message",
				isBot: true,
			});
			return;
		}

		this.emitOrderingEvent({
			message: message,
			eventName: "message",
			isBot: false,
		});

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
					message: "Chowbot: Invalid option. Please try again.",
					eventName: "message",
					isBot: true,
				});
				break;
		}
	}

	displayMenu(heading) {
		let message = `Chowbot: ${heading || ""}
    
    `;

		this.menu.forEach((item, index) => {
			message += `${index + 1}. ${item.name} - ${item.price}
      `;
		});
		message += `0. Go to main menu`;

		this.emitOrderingEvent({
			message: message,
			eventName: "menu",
			isBot: true,
		});
		this.socket.once("menu", (option) => {
			this.handleMenuOption(option);
		});
		return message;
	}

	handleMenuOption(option) {
		this.emitOrderingEvent({
			message: `You: ${option}`,
			eventName: "message",
			isBot: false,
		});

		const selectedOption = Number(option);
		const item = this.menu[selectedOption - 1];

		if (item) {
			// if this is the first item in the order, set order status
			if (!this.socket.request.session.currentOrder) {
				this.socket.request.session.orderStatus = ORDER_STATUS.PENDING;
				this.socket.request.session.currentOrder = [];
				this.saveSession();
			}

			// add item to order
			const orderItem = {
				name: item.name,
				price: item.price,
				qty: 1,
			};
			this.socket.request.session.currentOrder.push(orderItem);
			this.saveSession();

			this.displayMenu(
				`${item.name} added to order. Please select another item from the menu:`
			);
		} else if (selectedOption === 0) {
			this.init("Here you go...");
		} else {
			this.emitOrderingEvent({
				message: "Chowbot: Invalid option. Please try again.",
				eventName: "message",
				isBot: true,
			});
		}
	}

	checkout() {
		// if there is no pending order, display error message, else proceed to checkout
		if (this.socket.request.session.orderStatus !== ORDER_STATUS.PENDING) {
			let message = `Chowbot: No order to place!
      Please select an option:
      1. Place an order
      98. View order history
      `;

			this.emitOrderingEvent({
				message: message,
				eventName: "message",
				isBot: true,
			});
			return;
		}

		this.handleOrder();
		this.init("Order placed successfully! What would you like to do next?");
	}

	async handleOrder() {
		const date = new Date();
		const order = {
			status: ORDER_STATUS.CONFIRMED,
			date: date.toDateString(),
			items: this.socket.request.session.currentOrder,
			total: this.socket.request.session.currentOrder.reduce(
				(prev, curr) => prev + curr.price,
				0
			),
		};
		this.socket.request.session.orderStatus = ORDER_STATUS.NONE;
		this.socket.request.session.currentOrder = [];
		if (!Array.isArray(this.socket.request.session.orders)) {
			this.socket.request.session.orders = [order];
		} else {
			this.socket.request.session.orders = [
				...this.socket.request.session.orders,
				order,
			];
		}
		this.saveSession();

    await this.user.updateOne({
      $push: {
        orders: order,
      },
    });
	}

	showOrderHistory() {
		let message = ``;
		this.findUser()
			.then((user) => {
				if (user.orders.length) {
					message += parseOrderHistory(user.orders);
				} else {
					message += `Chowbot: It appears you have not placed any orders recently. Please select 0 to go back to the main menu.
      `;
				}
        message += `0. Go back to main menu`;

				this.emitOrderingEvent({
					message: message,
					eventName: "menu",
					isBot: true,
				});
				this.socket.once("menu", (option) => {
					this.handleMenuOption(option);
				});
			})
			.catch((err) => {
				console.log("Error finding user: ", err);
				throw new Error(err);
			});
	}

	showCurrentOrder() {
		if (
			!this.socket.request.session.orderStatus ||
			this.socket.request.session.orderStatus !== ORDER_STATUS.PENDING
		) {
			return this.init("No order in progress!");
		}

		const message = parseOrder(this.socket.request.session.currentOrder);

		this.emitOrderingEvent({
			message: message,
			eventName: "menu",
			isBot: true,
		});
		this.socket.once("menu", (option) => {
			this.handleMenuOption(option);
		});
	}

	cancelOrder() {
		if (this.socket.request.session.orderStatus !== ORDER_STATUS.PENDING) {
			return this.init("No order in progress!");
		}

		const date = new Date();
		const order = {
			status: ORDER_STATUS.CANCELLED,
			date: date.toDateString(),
			total: this.socket.request.session.currentOrder.reduce(
				(prev, curr) => prev + curr.price,
				0
			),
			items: this.socket.request.session.currentOrder,
		};
		this.socket.request.session.orderStatus = ORDER_STATUS.NONE;
		this.socket.request.session.currentOrder = [];
		if (!Array.isArray(this.socket.request.session.orders)) {
			this.socket.request.session.orders = [order];
		} else {
			this.socket.request.session.orders = [
				...this.socket.request.session.orders,
				order,
			];
		}
		this.saveSession();

		this.init("Order cancelled! Would you like to do anything else?");
	}
}

module.exports = OrderingSession;
