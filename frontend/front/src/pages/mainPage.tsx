import React, { useContext } from "react";
import "./mainPage.css";
import { LoginButton, FakeLoginButton } from "../components/buttons/buttons";
import UserContext, { UsernameSet } from "../contexts/UserContext";
/* load list user block and friend */
import { LoadUserGlobal } from '../contexts/DisplayChatContext';

const client_id = import.meta.env.VITE_APP_ID;
const app_uri = import.meta.env.VITE_APP_URI;
const redirect_uri = app_uri + "/validate";
const state = "pouet2";
const loginUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&scope=public&state=${state}'`;

function MainPage(props: {
  jwt: string,
  username: string,
  setUsername: React.Dispatch<React.SetStateAction<string>>
}) {
  const userCtx: any = useContext(UserContext);
  if (typeof userCtx.user != "undefined" && userCtx.user.jwt) {
    return (
      <div>
        <UsernameSet jwt={props.jwt}
          username={props.username} setUsername={props.setUsername} />
        <LoadUserGlobal jwt={props.jwt} />
        <img
          src='./public/transcendence.png'
          alt="transcendence picture"
          className='transcendence'
        />
        <div>Hello</div>
      </div>
    )
  }
  return (
    <div className="splash_middle">
      <img className='transcendence'
        src='./public/transcendence.png'
        alt="transcendence picture"
      />
      <div className="splash_content">
        <LoginButton url={loginUrl} />
      </div>
      <div className="splash_content">
        <FakeLoginButton />
      </div>
    </div>
  );
}

export default MainPage;
