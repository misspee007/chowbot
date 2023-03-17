# Chowbot
This is a restaurant chatbot that will assist customers in placing orders for their preferred meals.

---
## Live URL
https://chowbot.onrender.com

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

## Tools
- [Nodejs](https://nodejs.org)
- [Express](https://expressjs.com)
- [MongoDB](https://www.mongodb.com)
- [Mongoose](https://mongoosejs.com)
- [Socket.io](https://socket.io)
- [Express-Session](https://www.npmjs.com/package/express-session)
- [Reactjs](https://reactjs.org/)
- [React-Bootstrap](https://react-bootstrap.github.io)
- [Vite](https://vitejs.dev)

---
## Author
Precious Abubakar