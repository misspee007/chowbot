const { uuid } = require("uuidv4");
const { UserModel, ChatModel, MenuModel } = require("../models");

const ORDER_STATUS = {
	PENDING: "pending",
	CONFIRMED: "confirmed",
	CANCELLED: "cancelled",
	NONE: "none",
};

async function getMenu() {
	try {
		const menu = await MenuModel.find();
		return menu;
	} catch (err) {
		console.log("Error getting menu: ", err);
		throw new Error(err);
	}
}

const menu = getMenu();

class OrderingSessionEvent {
	constructor({ data, eventName, message, isBot }) {
		this.data = data;
		this.eventName = eventName;
		this.message = message;
		this.isBot = isBot;
	}
}

class OrderingSession {
	constructor(socket) {
		this.socket = socket;

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
				})
				.catch((err) => {
					console.log("Error creating user: ", err);
					throw new Error(err);
				});

			this.init("Welcome to Chowbot!");
		} else {
			this.findUser()
				.then((user) => {
					this.user = user;
				})
				.catch((err) => {
					console.log("Error finding user: ", err);
					throw new Error(err);
				});

			this.getChatHistory()
				.then((msgs) => {
					this.chatHistory = msgs;
					this.emitChatHistory(msgs);
				})
				.catch((err) => {
					console.log("Error getting chat history: ", err);
					throw new Error(err);
				});

			this.init("Welcome back to Chowbot!");
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
			const oldUser = await UserModel.findOne({ userId: this.userId }).populate(
				"orders"
			);
			// .populate("chatHistory");
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
				eventName: "message",
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

	emitOrderingEvent({ message, data, eventName }) {
		const newEvent = this.createOrderingEvent({
			message,
			data,
			eventName,
			isBot: true,
		});
		this.emitEvent(newEvent);
		this.saveMsg(message, true)
			.then(() => {
				console.log("Saved chat history");
			})
			.catch((err) => {
				console.log("Error saving chat history: ", err);
				throw new Error(err);
			});
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
				this.displayMenu("Please select an item:")
					.then((message) => {
						this.emitOrderingEvent({
							message: message,
							eventName: "menu",
						});
						this.socket.once("menu", (option) => {
							this.handleMenuOption(option);
						});
					})
					.catch((err) => {
						console.log("Error displaying menu: ", err);
						throw new Error(err);
					});
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

	async displayMenu(heading) {
		let message = `${heading || ""}
    `;
		try {
			const menu = await getMenu();
			menu.forEach((item, index) => {
				message += `${index + 1}. ${item.name} - ${item.price}
      `;
			});
			message += `0. Go to main menu`;
			return message;
		} catch (err) {
			console.log("Error getting menu: ", err);
			throw new Error(err);
		}
	}

	handleMenuOption(option) {
		const selectedOption = Number(option);
		const item = menu[selectedOption - 1];

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
			)
				.then((message) => {
					this.emitOrderingEvent({
						message: message,
						eventName: "menu",
					});
					this.socket.once("menu", (option) => {
						this.handleMenuOption(option);
					});
				})
				.catch((err) => {
					console.log("Error displaying menu: ", err);
					throw new Error(err);
				});
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
		// if there is no pending order, display error message, else proceed to checkout
		if (this.socket.request.session.orderStatus !== ORDER_STATUS.PENDING) {
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
		this.socket.request.session.orders = [
			...this.socket.request.session.orders,
			order,
		];
		this.saveSession();

		this.emitOrderingEvent({
			message: "Order placed successfully!",
			eventName: "message",
		});
	}

	showOrderHistory() {
		let message = "";
		this.findUser()
			.then((user) => {
				if (user.orders.length) {
					this.emitOrderingEvent({
						eventName: "orders",
						data: user.orders,
					});
					message = "0. Go back";
				} else {
					message = `It appears you have not placed any orders recently. Please select 0 to go back to the main menu.

      0. Go back
      `;
				}

				this.emitOrderingEvent({
					message: message,
					eventName: "menu",
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
		if (this.socket.request.session.orderStatus !== ORDER_STATUS.PENDING) {
			this.init("No order in progress!");
			return;
		}

		this.emitOrderingEvent({
			eventName: "order",
			data: this.socket.request.session.currentOrder,
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
		if (this.socket.request.session.orderStatus !== ORDER_STATUS.PENDING) {
			this.init("No order in progress!");
			return;
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
		this.socket.request.session.orders = [
			...this.socket.request.session.orders,
			order,
		];

		this.init("Order cancelled!");
	}
}

module.exports = OrderingSession;
