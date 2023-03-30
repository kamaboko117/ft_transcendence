import React, { useContext, useEffect, useState } from "react";
import "./mainPage.module.css";
import { LoginButton, FakeLoginButton } from "../components/buttons/buttons";
import UserContext, { User, UsernameSet } from "../contexts/UserContext";

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
        <div>Hello</div>
      </div>
    )
  }
  return (
    <div className={"splash_middle"}>
      <span>{app_uri}</span>
      <span>{redirect_uri}</span>

      <div className={"splash_content"}>
        <LoginButton url={loginUrl} />
      </div>
      <div className={"splash_content"}>
        <FakeLoginButton />
      </div>
    </div>
  );
}

export default MainPage;
