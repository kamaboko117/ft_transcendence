import React from "react";
import { LoginButton, FakeLoginButton } from "../components/buttons/buttons";
import { Navigate } from "react-router-dom";

const client_id = import.meta.env.VITE_APP_ID;
const app_uri = import.meta.env.VITE_APP_URI;
const redirect_uri = app_uri + "/validate";
const state = "pouet2";
const loginUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&scope=public&state=${state}'`;

function LoginPage(props: {jwt: string | null}) {

  return (
    <>
    {props.jwt && <Navigate to="/" />}
      <div>
        <h1>Please Log In</h1>
        <></>
        <LoginButton url={loginUrl} />
      </div>
      <FakeLoginButton />
    </>
  );
}

export default LoginPage;
