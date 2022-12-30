import React from "react";
import { Routes, Route } from "react-router-dom";

import LoginPage from "./pages/login";
import MainPage from "./pages/mainPage";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </div>
  );
}

export default App;
