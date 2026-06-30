import { createRoot } from "react-dom/client";
import App from "./app/App";
import { initAuth } from "./app/store";
import "./styles/index.css";

initAuth();

createRoot(document.getElementById("root")!).render(<App />);
  