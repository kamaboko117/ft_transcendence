import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App";
import { UserProvider } from "./contexts/UserContext";
import { ErrorBoundary } from 'react-error-boundary'

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <pre>{error.message}</pre>
    </div>
  );
}

root.render(
  //<React.StrictMode>
  <ErrorBoundary FallbackComponent={ErrorFallback}>
  <UserProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </UserProvider>
  </ErrorBoundary>
  //</React.StrictMode>
);
