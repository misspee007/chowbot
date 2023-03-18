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

Chowbot is easy to use. It will provide the user with a list of options, and the user will select an option by responding with the corresponding number. For example, A typical workflow:
- Chowbot will prompt the user to select an option from the main menu.
- The user will select `1` to place an order.
- Chowbot will prompt the user to select a meal from the menu.
- The user will select `1` to select the first meal on the menu.
- Chowbot will prompt the user to select another meal or go back to main menu.
- The user will select `0` to go back to the main menu.
- Chowbot will prompt the user to select an option from the main menu.
- The user will select `99` to proceed to checkout.
- Chowbot will send a comfirmatory message, and prompt the user to select an option from the main menu.

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

### Events
#### Server
| event  |  payload  |  description |
|---|---|---|
|  message  |  eventName, message, isBot |  Sends a message to the client. |
| chatHistory  | eventName, message, isBot |  Sends a message from the chat history to the client. Emitted when `getChatHistory()` method is called |

##### Event Payload
| field  |  data_type | description  |
|---|---|---|
|  message |  string |  The message to be sent |
| data  | any  |  Additional data to be sent |
| eventName  | string  |  The name of the event being emitted  |
| isBot  | boolean  |  Indicates if a message was initialised by the bot or the user  |


#### Client
| event  |  description |
|---|---|
|  message  |  Sends a message to the server |
| menu |  Sends a message to the server and triggers the server's `handleMenu()` method for processing menu selections |

##### Event Payload
| field  |  data_type | description  |
|---|---|---|
|  eventName |  string |  The name of the event |
| input  | string  | The message to be sent to the server |

---
## Development
### Prerequisites
- Make sure you have [Nodejs](https://nodejs.org) installed.
- Make sure you have [MongoDB](https://www.mongodb.com/) installed and running, or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for a cloud-based database.
- Make sure you have a [Sentry](https://sentry.io/) account for error logging. If you don't want to use Sentry, you can remove the `sentry` middleware from `backend/src/middleware/sentry.js` and `backend/src/app.js`.
### Starting the app
- Clone the repository
```bash
git clone https://github.com/misspee007/chowbot.git
```
- Navigate to the root folder, copy the .env.example file and fill in the values.
```bash
cp .env.example .env
```
- Navigate to frontend directory and install dependencies
```bash
cd frontend && npm install
```
- Run build command
```bash
npm run build
```

The build command will create a `dist` folder in the frontend directory. This folder will be used by the backend server to serve the frontend files.

- Open another terminal, navigate to backend directory, install dependencies and start server
```bash
cd backend && npm install
npm run start
```
- Go to http://localhost:\<PORT> to view. The default PORT is 3399.


### Seeding the database
- Run the seeder script to clear the database and seed it with menu items.

```bash
npm run seed
```

### File Structure
```
.
├── backend
│   ├── src
│   │   ├── controllers
│   │   │   └── OrderingSession.js //contains the logic for the ordering session
│   │   ├── config
│   │   │   └── index.js //contains the configuration for the app (i.e initialisation of env variables)
│   │   ├── database
│   │   │   ├── db.js //contains the connection to the database
│   │   │   ├── seeder.js //contains the logic for seeding the database. The seeder script will run this file.
│   │   │   └── index.js
│   │   ├── middleware
│   │   │   ├── sentry.js //contains the config for the sentry logging middleware
│   │   │   └── session.js //contains the config for the express-session middleware
│   │   ├── models
|   |   |   ├── chatModel.js
|   |   |   ├── menuModel.js
|   |   |   ├── userModel.js
│   │   │   └── index.js
│   │   └── utils
│   │       ├── orderSession.utils.js //helper functions and constand data for the ordering session component
│   │       ├── constants.js //contains constants used in the app
│   │       └── server.utils.js //helpers for server.js
│   ├── app.js //express app
│   ├── package-lock.json
│   ├── package.json //contains the dependencies for the backend
│   └── server.js //socket.io server
├── frontend
│   ├── src
│   │   ├── config
│   │   │   └── index.js
│   │   ├── App.jsx //main app component
│   │   └── index.html
│   ├── vite.config.js
│   ├── package-lock.json
│   └── package.json //contains the dependencies for the frontend
├── .env.example
├── .gitignore
├── .node-version //node version, required by the hosting platform, render.com
├── package.json //contains the scripts for the app used in production. Not recommended for development.
└── README.md
```

---
## Main Tools
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
