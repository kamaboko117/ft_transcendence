import React, { createContext, useEffect, useState } from "react";

const UserContext = createContext({});

export type User = {
  jwt: string | null,
  username: string | null
}

/* Verifier validite token */
/* redirect navigation pour renommer user si username === '' */
export function UserProvider(props: any) {
  let [user, setUser] = useState<User>();
  useEffect(() => {
    const jwt: string | null = localStorage.getItem("ft_transcendence_gdda_jwt");
    const username: string | null = localStorage.getItem("ft_transcendence_gdda_username");
    setUser({
      jwt: jwt,
      username: username
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
