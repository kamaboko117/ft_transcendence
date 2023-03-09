import React, { createContext, useEffect } from "react";
import { useState } from "react";

const UserContext = createContext({});

export type User = {
  jwt: string | null,
  username: string | null
}
/* Verifier validite token */
/* redirect navigation pour renommer user si username === '' */
export function UserProvider(props: any) {
  let [user, setUser] = useState<User>({
    jwt: localStorage.getItem("ft_transcendence_gdda_jwt"),
    username: localStorage.getItem("ft_transcendence_gdda_username")
  });
  useEffect(() => {
    setUser({
      jwt: localStorage.getItem("ft_transcendence_gdda_jwt"),
      username: localStorage.getItem("ft_transcendence_gdda_username")
    });
  }, []);
  function loginUser(props: User) {
    setUser(props);
    console.log(props);
    console.log("set localStorage");
    if (typeof user != "undefined") {
      if (props.jwt != null && props.username != null) {
        console.log("ALLLOO");
        localStorage.setItem("ft_transcendence_gdda_jwt", props.jwt);
        localStorage.setItem("ft_transcendence_gdda_username", props.username);
      }
    }
  }
  /* Faire une vrai deconnexion */
  function logoutUser() {
    console.log("logout");
    setUser({
      jwt: "",
      username: ""
    });
    localStorage.removeItem("ft_transcendence_gdda_jwt");
    localStorage.removeItem("ft_transcendence_gdda_username");
  }

  const getJwt = () => {
    return (user?.jwt);
  }

  const context = {
    user: user,
    loginUser: loginUser,
    logoutUser: logoutUser,
    getJwt: getJwt
  };
  return (
    <UserContext.Provider value={context}>
      {props.children}
    </UserContext.Provider>
  );
}

export default UserContext;
