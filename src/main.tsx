import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
// @ts-ignore
import '@fontsource-variable/outfit';

import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
