import "../../css/styles.css";
import { createRoot } from "react-dom/client";
import { SidePanelApp } from "./src/SidePanelApp";
import { Redux } from "@packages/state";

console.log("Sidebar script loaded");

(async () => {
  const root = document.getElementById("root");
  if (!root) throw new Error("Root element not found");

  await Redux.init();
  createRoot(root).render(<SidePanelApp />);
})();
