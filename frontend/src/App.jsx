import { createRoot } from "react-dom/client";

const App = () => {
  return <div>Hello World</div>;
};

const root = createRoot(document.getElementById("root"));
root.render(<App />);