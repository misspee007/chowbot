# Chowbot

This is a restaurant chatbot that assists customers in placing orders for their preferred meals.

---

## Live URL

https://chowbot.onrender.com

---

## About Chowbot

### Features

- User can place orders for their preferred meals.
- User can view, cancel or checkout a pending order.
- User can view order history, including cancelled orders.

### How it Works

A typical workflow is that the bot will prompt the user to select a meal from the menu, and the bot will create a `pending order` and add the meal to it. The user can then select another meal, proceed to checkout, or view the current (pending) order. If the user proceeds to checkout, they will receive a confirmation message, and the main menu. The customer can then view their order history or perform other actions. Chowbot communicates with the user through a number-based selection system. The bot uses websockets to maintain a bi-directional communication channel between the client and the server. The chat history and other data are managed using session and a NoSQL database.

---
## API
### Models

#### User
| field  |  data_type | constraints  |
|---|---|---|
|  userId | string  |  required, unique|
|  orders  | [ orderSchema ] |    |
|  chatHistory | ref - Chat  |   |

**Order Schema**
| field  |  data_type | constraints  |
|---|---|---|
|  status | string |  required, enum: ["pending", "confirmed", "cancelled"] |
|  date | string  |  required |
|  items  | [ name: string, price: number, qty: number ] |  required  |
|  total | number  |   |


#### Chat
| field  |  data_type | constraints  |
|---|---|---|
|  message |  string |  required, trim |
|  isBot |  boolean | required  |
|  user | ref - User |   |


#### Menu
| field  |  data_type | constraints  |
|---|---|---|
|  name |  string |  required |
|  price |  number | required  |

---
## Development
### Prerequisites
- A MongoDB
- A Sentry
### Starting the app
- Clone the repository
```

git clone https://github.com/misspee007/chowbot.git

```
- Navigate to the root folder, copy the .env.example file and fill in the values.
```

cp .env.example .env

```
- Install dependencies and start server
```

cd backend && npm install
npm run start

```
- Open another terminal, install frontend dependencies and start the app
```

cd frontend && npm install
npm run dev

```
- Go to http://localhost:5173 to view the app.

### Build
- Run build command
```

cd frontend
npm run build

```
- Go to http://localhost:\<PORT> to view. The default PORT is 3399.


### File Structure
```
.
├── backend
│   ├── src
│   │   ├── components
│   │   │   └── OrderingSession.js //contains the logic for the ordering session
│   │   ├── config
│   │   │   └── index.js //contains the configuration for the app (i.e initialisation of env variables)
│   │   ├── database
│   │   │   ├── db.js //contains the connection to the database
│   │   │   ├── seeder.js //contains the logic for seeding the database with menu items
│   │   │   └── index.js
│   │   ├── middleware
│   │   │   ├── sentry.js //contains the config for the sentry logging middleware
│   │   │   └── session.js //contains the config for the express-session middleware
│   │   ├── models
|   |   |   ├── chatModel.js
|   |   |   ├── menuModel.js
|   |   |   ├── userModel.js
│   │   │   └── index.js
│   │   ├── utils
│   │   │   ├── orderSession.utils.js //helper functions and constand data for the ordering session component
│   │   │   └── server.utils.js //helpers for server.js
│   ├── app.js //express app
│   ├── package-lock.json
│   ├── package.json
│   └── server.js //socket.io server
├── frontend
│   ├── src
│   │   ├── config
│   │   │   └── index.js
│   │   ├── App.jsx //main app component
│   │   └── index.html
│   ├── vite.config.js
│   ├── package-lock.json
│   └── package.json
├── .env.example
├── .gitignore
├── .node-version //node version, required by the hosting platform, render.com
└── README.md
```

---
## Tools
- [Nodejs](https://nodejs.org) - Backend runtime
- [Express](https://expressjs.com) - Backend framework
- [MongoDB](https://www.mongodb.com) - Database
- [Mongoose](https://mongoosejs.com) - MongoDB object modeling
- [Socket.io](https://socket.io) - Websocket library
- [Express-Session](https://www.npmjs.com/package/express-session) - Session management
- [Reactjs](https://reactjs.org/) - Frontend framework
- [React-Bootstrap](https://react-bootstrap.github.io) - UI library
- [Vite](https://vitejs.dev) - Frontend build tool
- [Sentry](https://sentry.io) - Error logging and monitoring

---
## Author
Precious Abubakar | [preciousdanabubakar@gmail.com](mailto:preciousdanabubakar@gmail.com)
```
