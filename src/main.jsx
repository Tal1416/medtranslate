import React from "react";
import { createRoot } from "react-dom/client";
import MedTranslate from "../medtranslate.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MedTranslate />
  </React.StrictMode>
);
