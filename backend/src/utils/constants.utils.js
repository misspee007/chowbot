const menuItems = [
	{
		name: "Jollof Rice",
		price: 800,
	},
	{
		name: "Fried Rice",
		price: 1000,
	},
	{
		name: "Salad",
		price: 500,
	},
	{
		name: "Fries",
		price: 300,
	},
	{
		name: "Chicken Wings",
		price: 600,
	},
	{
		name: "Coke",
		price: 200,
	},
	{
		name: "Zobo",
		price: 500,
	},
];

const ORDER_STATUS = {
	PENDING: "pending",
	CONFIRMED: "confirmed",
	CANCELLED: "cancelled",
	NONE: "none",
};

module.exports = { menuItems, ORDER_STATUS };
