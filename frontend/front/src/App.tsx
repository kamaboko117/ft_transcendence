import React, { useState, useContext, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import LoginPage from "./pages/login";
import Logout from "./pages/Logout";
import MainPage from "./pages/mainPage";
import ValidatePage from "./pages/validate";
import FakeLogin from "./pages/fake-login";
import CreateNewUser from "./pages/createNewUser";
import Counter from "./components/Counter";
import Homepage from "./components/Homepage";
import PlayerApp from "./components/PlayerApp";

/* NavBar */
import NavBar from './components/navbar/NavBar';

/*channel part */
import ListChannel from "./components/Chat/ListChannel";
import Chat from "./components/Chat/Chat";
import UnfoldDirectMessage from "./components/Chat/DirectMessage";

/* User profile part */
import UserProfile from "./pages/User/UserProfile";
import Setting from "./pages/User/Setting";
import FriendList from "./pages/User/FriendList";
import BlackList from "./pages/User/BlackList";
import FirstConnectionPage from "./components/Users/FirstConnectionPage";

/* FA */
import SettingFa from './components/Users/FA'

import PlayPage from "./pages/play";
import MatchmakingPage from "./pages/matchmaking";
//import ErrorBoundary from "./components/Chat/ErrorBoundary";
import { SocketProvider } from './contexts/Socket';
import { DisplayChatGlobalProvider } from "./contexts/DisplayChatContext";
import UserContext, { UsernameSet } from "./contexts/UserContext";
import { useLocation } from 'react-router-dom';

const ErrorPage = () => {
  const location = useLocation();
  console.log(location);
  if (location.state === null)
    return (<div>Error 404</div>);
  return (<div>Error {location.state.code}</div>)
}

function App() {
  const [username, setUsername] = useState<string>("");
  const userCtx: any = useContext(UserContext);
  let jwt = userCtx.getJwt();

  return (
    <>
      <SocketProvider>
        <DisplayChatGlobalProvider jwt={jwt}>
          <Routes>
            <Route path="/" element={
              <>{jwt && jwt != "" && <UnfoldDirectMessage /*render={renderDirectMessage} id={id}*/
                width={600} height={280} opacity={1} jwt={jwt} /*setId={setId}*/ />}
                <NavBar /><MainPage jwt={jwt} username={username} setUsername={setUsername} /><PlayerApp />
              </>} />
            <Route path="/first-connection" element={
              <>
                <NavBar /><FirstConnectionPage jwt={jwt} /><PlayerApp />
              </>} />
            <Route path="/profile" element={
              <>{jwt && jwt != "" && <UnfoldDirectMessage /*render={renderDirectMessage} id={id}*/
                width={600} height={280} opacity={1} jwt={jwt} /*setId={setId}*/ />}
                <NavBar />
                <UserProfile jwt={jwt} /><PlayerApp />
                <UsernameSet jwt={jwt} username={username} setUsername={setUsername} />
              </>
            } />
            <Route path="/friendList" element={
              <>{jwt && jwt != "" && <UnfoldDirectMessage /*render={renderDirectMessage} id={id}*/
                width={600} height={280} opacity={1} jwt={jwt} /*setId={setId}*/ />}
                <NavBar />
                <FriendList jwt={jwt} /><PlayerApp />
                <UsernameSet jwt={jwt} username={username} setUsername={setUsername} />
              </>} />
            <Route path="/blackList" element={
              <>{jwt && jwt != "" && <UnfoldDirectMessage /*render={renderDirectMessage} id={id}*/
                width={600} height={280} opacity={1} jwt={jwt} /*setId={setId}*/ />}
                <NavBar />
                <BlackList /><PlayerApp />
                <UsernameSet jwt={jwt} username={username} setUsername={setUsername} />
              </>
            } />
            <Route path="/setting" element={
              <>{jwt && jwt != "" && <UnfoldDirectMessage /*render={renderDirectMessage} id={id}*/
                width={600} height={280} opacity={1} jwt={jwt} /*setId={setId}*/ />}
                <NavBar />
                <Setting /><PlayerApp />
                <UsernameSet jwt={jwt} username={username} setUsername={setUsername} />
              </>
            } />
            <Route path="/login" element={
              <>
                <NavBar />
                <LoginPage /><PlayerApp />
              </>
            } />
            <Route path="/fa-activate" element={
              <>
                <NavBar />
                <SettingFa jwt={jwt} /><PlayerApp />
                <UsernameSet jwt={jwt} username={username} setUsername={setUsername} />
              </>
            } />
            <Route path="/fake-login" element={
              <>{jwt && jwt != "" && <UnfoldDirectMessage /*render={renderDirectMessage} id={id}*/
                width={600} height={280} opacity={1} jwt={jwt} /*setId={setId}*/ />}
                <NavBar />
                <FakeLogin />
                <PlayerApp />
              </>
            } />
            <Route path="/logout" element={<Logout />} />
            <Route path="/validate" element={
              <>{jwt && jwt != "" && <UnfoldDirectMessage /*render={renderDirectMessage} id={id}*/
                width={600} height={280} opacity={1} jwt={jwt} /*setId={setId}*/ />}
                <NavBar />
                <ValidatePage />
                <PlayerApp />
                <UsernameSet jwt={jwt} username={username} setUsername={setUsername} />
              </>
            } />
            <Route path="/register" element={<CreateNewUser />} />
            <Route path="/counter" element={<Counter />} />
            <Route path="/channels" element={
              <>{jwt && jwt != "" && <UnfoldDirectMessage /*render={renderDirectMessage} id={id}*/
                width={600} height={280} opacity={1} jwt={jwt} /*setId={setId}*/ />}
                <NavBar />
                <ListChannel jwt={jwt} /><PlayerApp />
                <UsernameSet jwt={jwt} username={username} setUsername={setUsername} />
              </>
            }>
              <Route path=":id" element={<Chat jwt={jwt} />} />
            </Route>
            <Route path="/play" element={
              <>{jwt && jwt != "" && <UnfoldDirectMessage /*render={renderDirectMessage} id={id}*/
                width={600} height={280} opacity={1} jwt={jwt} /*setId={setId}*/ />}
                <NavBar />
                <PlayPage jwt={jwt} /><PlayerApp />
                <UsernameSet jwt={jwt} username={username} setUsername={setUsername} />
              </>
            } />
            <Route path="/matchmaking" element={
              <>{jwt && jwt != "" && <UnfoldDirectMessage /*render={renderDirectMessage} id={id}*/
                width={600} height={280} opacity={1} jwt={jwt} /*setId={setId}*/ />}
                <NavBar />
                <MatchmakingPage /><PlayerApp />
                <UsernameSet jwt={jwt} username={username} setUsername={setUsername} />
              </>
            } />
            <Route path="/error-page" element={<><NavBar /><ErrorPage /></>} />
            <Route path="*" element={<><ErrorPage /></>} />
          </Routes>

        </DisplayChatGlobalProvider>
      </SocketProvider>
    </>
  );
}

export default App;
