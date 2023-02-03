import React from "react";
import { Routes, Route } from "react-router-dom";

import LoginPage from "./pages/login";
import MainPage from "./pages/mainPage";
import ValidatePage from "./pages/validate";
import CreateNewUser from "./pages/createNewUser";
import PlayPage from "./pages/play";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/validate" element={<ValidatePage />} />
        <Route path="/register" element={<CreateNewUser />} />
        <Route path="/play" element={<PlayPage />} />
      </Routes>
    </div>
  );
}

export default App;
