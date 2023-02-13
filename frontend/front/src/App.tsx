import React, {useContext} from "react";
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
import ListChannel from "./components/Chat/ListChannel";
import Chat from "./components/Chat/Chat";

import PlayPage from "./pages/play";
import MatchmakingPage from "./pages/matchmaking";

import { usrSocket, SocketContext } from './contexts/Socket';


function App() {
  const jwt: string | null = localStorage.getItem("ft_transcendence_gdda_jwt");
  console.log(jwt);
  return (
    <>
      <div>
        <SocketContext.Provider value={usrSocket}>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/profile" />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/validate" element={<ValidatePage />} />
            <Route path="/register" element={<CreateNewUser />} />
            <Route path="/counter" element={<Counter />} />
            <Route path="/channels" element={<ListChannel jwt={jwt} />}>
              <Route path=":id" element={<Chat />} />
            </Route>
            <Route path="/ws" element={<WebSocketTestGc id={0} />} />
            <Route path="/play" element={<PlayPage />} />
            <Route path="/matchmaking" element={<MatchmakingPage />} />
          </Routes>
        </SocketContext.Provider>
      </div>
      <PlayerApp />
    </>
  );
}

export default App;
