import React from "react";
import { Routes, Route } from "react-router-dom";

import LoginPage from "./pages/login";
import MainPage from "./pages/mainPage";
import ValidatePage from "./pages/validate";
import CreateNewUser from "./pages/createNewUser";
import Counter from "./components/Counter";
import Homepage from "./components/Homepage";
import PlayerApp from "./components/PlayerApp";
import WebSocketTestGc from './TestWebSocketGc'
/*channel part */
import ListChannel from "./components/ListChannel";
import Chat from "./components/Chat";

import PlayPage from "./pages/play";
import { usrSocket, SocketContext } from './contexts/Socket';

function App() {
  return (
    <>
      <div>
        <SocketContext.Provider value={usrSocket}>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/validate" element={<ValidatePage />} />
            <Route path="/register" element={<CreateNewUser />} />
            <Route path="/counter" element={<Counter />} />
            <Route path="/channels" element={<ListChannel />}>
              <Route path=":id" element={<Chat />} />
            </Route>
            <Route path="/ws" element={<WebSocketTestGc id={0} />} />
            <Route path="/play" element={<PlayPage />} />
          </Routes>
        </SocketContext.Provider>
      </div>
      <PlayerApp />
    </>
  );
}

export default App;
