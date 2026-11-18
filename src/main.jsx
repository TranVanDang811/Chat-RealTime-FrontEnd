import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./routes"; // router đã được tạo sẵn với createBrowserRouter
import "./index.css";
import { Buffer } from "buffer";

// Polyfill cho browser
if (!window.global) window.global = window;
if (!window.Buffer) window.Buffer = Buffer;

// Redux
import { Provider } from "react-redux";
import { store } from "./app/store";
import { ToastProvider } from "./components/common/ToastContext";

const root = createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </Provider>
  </React.StrictMode>
);