import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";

import LoginPage from "./pages/login";
import Logout from "./pages/Logout";
import MainPage from "./pages/mainPage";
import ValidatePage from "./pages/validate";
import FakeLogin from "./pages/fake-login";
import CreateNewUser from "./pages/createNewUser";
import Counter from "./components/Counter";
import Homepage from "./components/Homepage";
import PlayerApp from "./components/PlayerApp";
import WebSocketTestGc from './TestWebSocketGc'

/* NavBar */
import NavBar from './components/navbar/NavBar';

/*channel part */
import ListChannel from "./components/Chat/ListChannel";
import Chat from "./components/Chat/Chat";
import DirectMessage from "./components/Chat/DirectMessage";

/* User profile part */
import UserProfile from "./pages/User/UserProfile";
import Setting from "./pages/User/Setting";
import FriendList from "./pages/User/FriendList";
import BlackList from "./pages/User/BlackList";


import PlayPage from "./pages/play";
import MatchmakingPage from "./pages/matchmaking";
//import ErrorBoundary from "./components/Chat/ErrorBoundary";
import { usrSocket, SocketContext } from './contexts/Socket';
import { ErrorBoundary } from 'react-error-boundary'
import ContextDisplayChannel from "./contexts/displayChat";

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <pre>{error.message}</pre>
    </div>
  )
}

function App() {
  const jwt: string | null = localStorage.getItem("ft_transcendence_gdda_jwt");
  console.log(jwt);
  const [renderDirectMessage, setDisplay] = useState<boolean>(false);
  const [userId, setUserId] = useState<number>(0);
  const providers = {
    renderDirectMessage: renderDirectMessage,
    userId: userId,
    setDisplay: setDisplay,
    setUserId: setUserId
  };
  return (
    <>
      <div>
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
        //onReset={(res) => {
        // reset the state of your app so the error doesn't happen again
        //}}
        >
          <SocketContext.Provider value={usrSocket}>
            <NavBar />
            <ContextDisplayChannel.Provider value={providers}>
              <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/profile" element={<UserProfile jwt={jwt} />} />
                <Route path="/friendList" element={<FriendList />} />
                <Route path="/blackList" element={<BlackList />} />
                <Route path="/setting" element={<Setting />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/fake-login" element={<FakeLogin />} />
                <Route path="/logout" element={<Logout />} />
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
              {<DirectMessage render={renderDirectMessage} id={0}
                width={600} height={200} opacity={1} />}
            </ContextDisplayChannel.Provider>
          </SocketContext.Provider>
        </ErrorBoundary>
      </div>
      <PlayerApp />
    </>
  );
}

export default App;
