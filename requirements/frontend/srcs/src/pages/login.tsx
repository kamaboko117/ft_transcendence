import React from 'react';
import LoginButton from "../components/buttons/buttons";

const client_id = process.env.REACT_APP_APP_ID
const app_uri = process.env.REACT_APP_APP_URI
const redirect_uri = app_uri + "/validate"
const state = "pouet2"
const loginUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&scope=public&state=${state}'`;

function LoginPage() {
  return (
    <div>
      <h1>Please Log In</h1>
      <LoginButton url={loginUrl} />
    </div>
  );
}

export default LoginPage;
