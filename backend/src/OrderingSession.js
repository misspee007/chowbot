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
		this.orderStatus = "";
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

		this.socket.on("message", (message) => {
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

    this.socket.on("menu", (option) => {
      this.handleMenuOption(option);
    });
	}

  handleMenuOption(option) {
		const selectedOption = Number(option);
    const item = this.menu[selectedOption - 1];

    // if selected option is a valid menu item, add to order, else display error message
		if (item) {
      this.order.push(item);
      if (this.order.length === 1) {
        this.orderStatus = orderStatus.PENDING;
      }
			this.emitOrderingEvent({
				message:
					`${item.name} added to order. Please select another item from the menu:`,
				eventName: "message",
			});
			this.displayMenu();
      // if it's the first item in the order, set the order status to pending
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

    // place order
    this.orderStatus = orderStatus.COMPLETED;
    this.emitOrderingEvent({
      message: "Order placed successfully!",
      eventName: "message",
    });
    this.init();
	}

	showOrderHistory() {
		this.emitOrderingEvent({
      eventName: "orders",
      data: {
        orders: this.orders,
      },
    });
	}

	showCurrentOrder() {
		console.log("showCurrentOrder");
	}

	cancelOrder() {
		console.log("cancelOrder");
	}
}

module.exports = OrderingSession;

// TODO: Fix menu event loop bug