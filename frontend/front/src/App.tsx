import React, { useState, useContext, useEffect } from "react";
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

import PlayPage from "./pages/play";
import MatchmakingPage from "./pages/matchmaking";
//import ErrorBoundary from "./components/Chat/ErrorBoundary";
import { SocketProvider } from './contexts/Socket';
import ContextDisplayChannel, { typeListUser } from "./contexts/displayChat";
import UserContext from "./contexts/UserContext";
import { useLocation } from 'react-router-dom';

type lstMsg = {
  lstMsg: Array<{
    idUser: string,
    content: string,
    img: string
  }>
}

const ErrorPage = () => {
  const location = useLocation();
  console.log(location);
  if (location.state === null)
    return (<div>Error 404</div>);
  return (<div>Error {location.state.code}</div>)
}

function App() {
  //const jwt: string | null = localStorage.getItem("ft_transcendence_gdda_jwt");
  const userCtx: any = useContext(UserContext);
  const [renderDirectMessage, setDisplay] = useState<boolean>(false);
  const [userId, setUserId] = useState<number>(0);
  const [id, setId] = useState<string>("");
  const [lstMsgChat, setLstMsgChat] = useState<lstMsg[]>([] as lstMsg[]);
  const [lstMsgPm, setLstMsgPm] = useState<lstMsg[]>([] as lstMsg[]);
  const [lstUserChat, setLstUserChat] = useState<typeListUser["listUser"]>(Array);
  const [lstUserPm, setLstUserPm] = useState<typeListUser["listUser"]>(Array);
  const providers = {
    renderDirectMessage: renderDirectMessage,
    userId: userId,
    id: id,
    lstMsgChat: lstMsgChat,
    lstMsgPm: lstMsgPm,
    lstUserChat: lstUserChat,
    lstUserPm: lstUserPm,
    setDisplay: setDisplay,
    setUserId: setUserId,
    setId: setId,
    setLstMsgChat: setLstMsgChat,
    setLstMsgPm: setLstMsgPm,
    setLstUserChat: setLstUserChat,
    setLstUserPm: setLstUserPm
  };
  let jwt = userCtx.getJwt();

  return (
    <>
      <SocketProvider>
        <ContextDisplayChannel.Provider value={providers}>
          <Routes>
            <Route path="/" element={
              <>{jwt && jwt != "" && <UnfoldDirectMessage render={renderDirectMessage} id={id}
                width={600} height={280} opacity={1} jwt={jwt} setId={setId} />}
                <NavBar /><MainPage jwt={jwt} /><PlayerApp />
              </>} />
            <Route path="/profile" element={
              <>{jwt && jwt != "" && <UnfoldDirectMessage render={renderDirectMessage} id={id}
                width={600} height={280} opacity={1} jwt={jwt} setId={setId} />}
                <NavBar />
                <UserProfile jwt={jwt} /><PlayerApp />
              </>
            } />
            <Route path="/friendList" element={
              <>{jwt && jwt != "" && <UnfoldDirectMessage render={renderDirectMessage} id={id}
                width={600} height={280} opacity={1} jwt={jwt} setId={setId} />}
                <NavBar />
                <FriendList /><PlayerApp />
              </>} />
            <Route path="/blackList" element={
              <>{jwt && jwt != "" && <UnfoldDirectMessage render={renderDirectMessage} id={id}
                width={600} height={280} opacity={1} jwt={jwt} setId={setId} />}
                <NavBar />
                <BlackList /><PlayerApp />
              </>
            } />
            <Route path="/setting" element={
              <>{jwt && jwt != "" && <UnfoldDirectMessage render={renderDirectMessage} id={id}
                width={600} height={280} opacity={1} jwt={jwt} setId={setId} />}
                <NavBar />
                <Setting /><PlayerApp />
              </>
            } />
            <Route path="/login" element={
              <>
                <NavBar />
                <LoginPage /><PlayerApp />
              </>
            } />
            <Route path="/fake-login" element={
              <>{jwt && jwt != "" && <UnfoldDirectMessage render={renderDirectMessage} id={id}
                width={600} height={280} opacity={1} jwt={jwt} setId={setId} />}
                <NavBar />
                <FakeLogin />
                <PlayerApp />
              </>
            } />
            <Route path="/logout" element={<Logout />} />
            <Route path="/validate" element={
              <>{jwt && jwt != "" && <UnfoldDirectMessage render={renderDirectMessage} id={id}
                width={600} height={280} opacity={1} jwt={jwt} setId={setId} />}
                <NavBar />
                <ValidatePage />
                <PlayerApp />
              </>
            } />
            <Route path="/register" element={<CreateNewUser />} />
            <Route path="/counter" element={<Counter />} />
            <Route path="/channels" element={
              <>{jwt && jwt != "" && <UnfoldDirectMessage render={renderDirectMessage} id={id}
                width={600} height={280} opacity={1} jwt={jwt} setId={setId} />}
                <NavBar />
                <ListChannel jwt={jwt} /><PlayerApp />
              </>
            }>
              <Route path=":id" element={<Chat jwt={jwt} />} />
            </Route>
            <Route path="/play" element={
              <>{jwt && jwt != "" && <UnfoldDirectMessage render={renderDirectMessage} id={id}
                width={600} height={280} opacity={1} jwt={jwt} setId={setId} />}
                <NavBar />
                <PlayPage jwt={jwt} /><PlayerApp />
              </>
            } />
            <Route path="/matchmaking" element={
              <>{jwt && jwt != "" && <UnfoldDirectMessage render={renderDirectMessage} id={id}
                width={600} height={280} opacity={1} jwt={jwt} setId={setId} />}
                <NavBar />
                <MatchmakingPage /><PlayerApp />
              </>
            } />
            <Route path="/error-page" element={<><NavBar /><ErrorPage /></>} />
            <Route path="*" element={<><ErrorPage /></>} />
          </Routes>

        </ContextDisplayChannel.Provider>
      </SocketProvider>
    </>
  );
}

export default App;
