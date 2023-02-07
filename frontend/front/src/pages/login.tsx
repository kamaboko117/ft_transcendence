import React from "react";
import LoginButton from "../components/buttons/buttons";
import { Navigate } from "react-router-dom";

const client_id = import.meta.env.VITE_APP_ID;
const app_uri = import.meta.env.VITE_APP_URI;
const redirect_uri = app_uri + "/validate";
const state = "pouet2";
//const loginUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&scope=public&state=${state}'`;
const loginUrl = 'http://localhost:4000/api/users/validate';
function LoginPage(props: any) {
  if (props.user) return <Navigate to="/" />;
  return (
    <div>
      <h1>Please Log In</h1>
      <LoginButton url={loginUrl} />
    </div>
  );
}

export default LoginPage;
