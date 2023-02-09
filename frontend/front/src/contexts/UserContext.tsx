import React, { createContext } from "react";
import { useState } from "react";

const UserContext = createContext({});

export function UserProvider(props: any) {
  let [user, setUser] = useState({});
  function loginUser(props: any) {
    setUser(props);
  }

  function logoutUser() {
    setUser({});
  }

  if (localStorage.getItem("user")) {
    user = JSON.parse(localStorage.getItem("user") as string);
  }
  const context = {
    user: user,
    loginUser: loginUser,
    logoutUser: logoutUser,
  };
  return (
    <UserContext.Provider value={context}>
      {props.children}
    </UserContext.Provider>
  );
}

export default UserContext;
