import React, { createContext, useEffect } from "react";
import { useState } from "react";
import { FetchError} from '../components/FetchError';

const UserContext = createContext({});

/* userId only for for convenient front, do not send it to backend */
export type User = {
  jwt: string | null,
  username: string | null,
  userId: string | null
}
/* Verifier validite token */
/* redirect navigation pour renommer user si username === '' */
export function UserProvider(props: any) {
  let [user, setUser] = useState<User>({
    jwt: localStorage.getItem("ft_transcendence_gdda_jwt"),
    username: localStorage.getItem("ft_transcendence_gdda_username"),
    userId: localStorage.getItem("ft_transcendence_gdda_userid")
  });
  useEffect(() => {
    setUser({
      jwt: localStorage.getItem("ft_transcendence_gdda_jwt"),
      username: localStorage.getItem("ft_transcendence_gdda_username"),
      userId: localStorage.getItem("ft_transcendence_gdda_userid")
    });
  }, []);
  function loginUser(props: User) {
    setUser(props);
    console.log(props);
    console.log("set localStorage");
    if (typeof user != "undefined") {
      if (props.jwt != null && props.username != null && props.userId) {
        localStorage.setItem("ft_transcendence_gdda_jwt", props.jwt);
        localStorage.setItem("ft_transcendence_gdda_username", props.username);
        localStorage.setItem("ft_transcendence_gdda_userid", props.userId);
      }
    }
  }
  /* Faire une vrai deconnexion */
  function logoutUser() {
    console.log("logout");
    setUser({
      jwt: "",
      username: "",
      userId: ""
    });
    localStorage.removeItem("ft_transcendence_gdda_jwt");
    localStorage.removeItem("ft_transcendence_gdda_username");
    localStorage.removeItem("ft_transcendence_gdda_userid");
  }

  const getJwt = () => {
    return (user?.jwt);
  }

  const getUserId = () => {
    return (user?.userId);
  }

  const context = {
    user: user,
    loginUser: loginUser,
    logoutUser: logoutUser,
    getJwt: getJwt,
    getUserId: getUserId
  };
  
  return (
    <UserContext.Provider value={context}>
      {props.children}
    </UserContext.Provider>
  );
}

export default UserContext;
