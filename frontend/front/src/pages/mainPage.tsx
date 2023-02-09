import React, { useContext } from "react";
import classes from "./mainPage.module.css";

import LoginButton from "../components/buttons/buttons";
import UserContext from "../contexts/UserContext";

const client_id = import.meta.env.VITE_APP_ID;
const app_uri = import.meta.env.VITE_APP_URI;
const redirect_uri = app_uri + "/validate";
const state = "pouet2";
const loginUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&scope=public&state=${state}'`;

function MainPage() {
  const userCtx: any = useContext(UserContext);
  if (userCtx.user.username) {
    console.log("logged in as " + userCtx.user.username);
    return (
      <div>
        <div className={classes.chat}>
          <div className={classes.panel}>
            <div className={classes.panel_input}>
              <input type="text" placeholder="Message" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={classes.splash_middle}>
      <span>{app_uri}</span>
      <span>{redirect_uri}</span>
      <img
        src="https://cdn.discordapp.com/attachments/293910473663971328/1041748304377155704/kamaboko_a_favicon_for_a_website_where_you_can_play_pong_7e1346ef-31c0-47ec-b09a-4455365e1ef6.png"
        className={classes.splash_logo}
        alt=""
      />
      <div className={classes.splash_content}>
        <LoginButton url={loginUrl} />
      </div>
    </div>
  );
}

export default MainPage;
