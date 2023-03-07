const orderStatus = {
	IN_PROGRESS: "in_progress",
	COMPLETED: "completed",
	CANCELLED: "cancelled",
};

class OrderingSessionEvent {
	constructor({ data, eventName, message }) {
		this.data = data;
		this.eventName = eventName;
		this.message = message;
	}
}

class OrderingSession {
	constructor({ io }) {
		this.socket = io;
		this.orderStatus = orderStatus.IN_PROGRESS;
		this.events = [];
	}

	createOrderingEvent(event) {
		const event = new OrderingSessionEvent(event);
		this.events.push(event);
		return event;
	}

	emitEvent(event) {
		this.socket.emit(event.eventName, event);
	}

	emitOrderingEvent({ message, data, eventName }) {
		const event = this.createOrderingEvent({ message, data, eventName });
		this.emitEvent(event);
	}
}

module.exports = OrderingSession;
