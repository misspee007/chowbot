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

class OrderingSession {
	constructor(socket) {
		this.socket = socket;
		this.user = socket.id;
		this.orderStatus = null;
		this.menu = menu;
		this.order = [];
		this.orders = [];
		this.events = [];

		this.emitOrderingEvent({
			message: "Welcome to Chowbot!",
			eventName: "message",
		});
		this.init();
	}

	init() {
		this.emitOrderingEvent({
			message: "Please select an option:",
			eventName: "message",
		});
		this.emitOrderingEvent({
			message: "1. Place an order",
			eventName: "message",
		});
		this.emitOrderingEvent({
			message: "99. Proceed to checkout",
			eventName: "message",
		});
		this.emitOrderingEvent({
			message: "98. View order history",
			eventName: "message",
		});
		this.emitOrderingEvent({
			message: "97. View current order",
			eventName: "message",
		});
		this.emitOrderingEvent({
			message: "0. Cancel order",
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
				this.emitOrderingEvent({
					message: "Please select an item from the menu:",
					eventName: "message",
				});
				this.displayMenu();
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
		this.events.push(newEvent);
		return newEvent;
	}

	emitEvent(event) {
		this.socket.emit(event.eventName, event);
	}

	emitOrderingEvent({ message, data, eventName }) {
		const newEvent = this.createOrderingEvent({ message, data, eventName });
		this.emitEvent(newEvent);
	}

	displayMenu() {
		this.menu.forEach((item, index) => {
			this.emitOrderingEvent({
				message: `${index + 1}. ${item.name} - ₦${item.price}`,
				eventName: "menu",
			});
		});
		this.emitOrderingEvent({
			message: "0. Go to main menu",
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
			if (this.order.length === 0) {
				this.orderStatus = orderStatus.PENDING;
			}

			// add item to order
			const orderItem = {
				name: item.name,
				price: item.price,
				qty: 1,
			};
			this.order.push(orderItem);

			this.emitOrderingEvent({
				message: `${item.name} added to order. Please select another item from the menu:`,
				eventName: "message",
			});
			this.displayMenu();
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
		if (this.orderStatus !== orderStatus.PENDING) {
			this.emitOrderingEvent({
				message: "No order to place!",
				eventName: "message",
			});
			this.emitOrderingEvent({
				message: "Please select an option:",
				eventName: "message",
			});
			this.emitOrderingEvent({
				message: "1. Place an order",
				eventName: "message",
			});
			this.emitOrderingEvent({
				message: "98. View order history",
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
      id: this.orders.length + 1,
      status: orderStatus.COMPLETED,
      date: date.toDateString(),
      total: this.order.reduce((prev, curr) => prev + curr.price, 0),
      items: this.order,
    };
    this.order = [];
    this.orders.push(order);
    this.orderStatus = null;
		this.emitOrderingEvent({
			message: "Order placed successfully!",
			eventName: "message",
		});
  }

	showOrderHistory() {
		this.emitOrderingEvent({
			eventName: "orders",
			data: this.orders,
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
    if (this.orderStatus !== orderStatus.PENDING) {
      this.emitOrderingEvent({
        message: "No order in progress!",
        eventName: "message",
      });
      this.init();
      return;
    }

		this.emitOrderingEvent({
      eventName: "order",
      data: this.order,
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
		if (this.orderStatus !== orderStatus.PENDING) {
      this.emitOrderingEvent({
        message: "No order in progress!",
        eventName: "message",
      });
      this.init();
      return;
    }

    const date = new Date();
    const order = {
      id: this.orders.length + 1,
      status: orderStatus.CANCELLED,
      date: date.toDateString(),
      total: this.order.reduce((prev, curr) => prev + curr.price, 0),
      items: this.order,
    };
    this.order = [];
    this.orders.push(order);
    this.orderStatus = null;
    this.emitOrderingEvent({
      message: "Order cancelled!",
      eventName: "message",
    });
    this.init();
	}
}

module.exports = OrderingSession;