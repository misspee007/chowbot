import { createRoot } from "react-dom/client";
import io from "socket.io-client";
import CONFIG from "./config";

const socket = io(CONFIG.API_URL);

const App = () => {
  socket.on("connect", () => {
    console.log("Connected to server");
  });

  return <div>Hello World</div>;
};

const root = createRoot(document.getElementById("root"));
root.render(<App />);