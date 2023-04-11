import { createContext } from "react";
import React, { useState } from "react";

const UserContext = createContext({});

export function UserProvider(props: any) {
  function loginUser(props: any) {
    setUser(props);
  }

  function logoutUser() {
    setUser({});
  }
  let [user, setUser] = useState({});
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
