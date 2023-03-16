import { useEffect, useState, useRef } from "react";
import { Container, Row, Col, Form, Button, ListGroup } from "react-bootstrap";
import { createRoot } from "react-dom/client";
import io from "socket.io-client";
import CONFIG from "./config";

const socket = io(CONFIG.API_URL, {
	withCredentials: true,
});

const App = () => {
	const [messages, setMessages] = useState([]);
	const [eventName, setEventName] = useState("");
	const [input, setInput] = useState("");
	const messagesEndRef = useRef(null);

	useEffect(() => {
		socket.on("connect", () => {
			console.log("Connected to server");
		});

		socket.on("message", (message) => {
			setMessages((messages) => [...messages, message.message]);
			setEventName(message.eventName);
		});

		socket.on("menu", (menu) => {
			setMessages((messages) => [...messages, menu.message]);
			setEventName(menu.eventName);
		});

		socket.on("orders", (orders) => {
			parseOrderHistory(orders.data);
		});

		socket.on("order", (order) => {
			parseOrder(order.data);
		});
	}, []);

	useEffect(() => {
		messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const handleInput = (e) => {
		setInput(e.target.value);
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		socket.emit(eventName, input);
		setInput("");
	};

	function parseOrderHistory(orders) {
		setMessages((messages) => [...messages, "Order History: "]);

		orders.forEach((order) => {
			setMessages((messages) => [...messages, `Date: ${order.date}`]);
			setMessages((messages) => [
				...messages,
				`Order ID: ${order.id} - ${order.status}`,
			]);

			order.items.forEach((item, index) => {
				setMessages((messages) => [
					...messages,
					`${index + 1}. ${item.name} - ₦${item.price} x ${item.qty}`,
				]);
			});

			setMessages((messages) => [...messages, `Total: ₦${order.total}`]);
		});
	}

	function parseOrder(order) {
		setMessages((messages) => [...messages, "Order: "]);

		order.forEach((item, index) => {
			setMessages((messages) => [
				...messages,
				`${index + 1}. ${item.name} - ₦${item.price} x ${item.qty}`,
			]);
		});
	}

	return (
		<div>
			<Container className="my-3">
				<Row className="justify-content-center">
					<Col md={8} lg={6}>
						<h1 className="text-center mb-4">Restaurant Chatbot</h1>
						<div className="chat-container">
							<ListGroup>
								{messages.map((message, index) => (
									<ListGroup.Item key={index}>
										<div style={{ whiteSpace: "pre-line" }}>{message}</div>
									</ListGroup.Item>
								))}
							</ListGroup>
							<div ref={messagesEndRef}></div>
						</div>
						<Form onSubmit={handleSubmit} className="mt-3">
							<Form.Group>
								<Form.Control
									type="text"
									placeholder="Type your message here..."
									value={input}
									onChange={handleInput}
									required
								/>
							</Form.Group>
							<Button variant="primary" type="submit" className="w-100">
								Send
							</Button>
						</Form>
					</Col>
				</Row>
			</Container>
		</div>
	);
};

const root = createRoot(document.getElementById("root"));
root.render(<App />);
