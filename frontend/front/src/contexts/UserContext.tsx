import React, { createContext, useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FetchError, header} from '../components/FetchError';

const UserContext = createContext({});

/* userId only for for convenient front, do not send it to backend */
export type User = {
  jwt: string | null,
  username: string | null,
  userId: string | null
}

//check if user is correctly logged
//check if username is empty
//if empty, this is a first connection
export const UsernameSet = (props: {jwt: string,
  username: string,
  setUsername: React.Dispatch<React.SetStateAction<string>>}) => {
  const [errorCode, setErrorCode] = useState<number>(200);
  const [load, setLoad] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    //check if user json web token is still valid
    //and need to check if username in db is set, to know if it's a first connection
    const login = async () => {
      if (props.jwt) {
        await fetch('http://' + location.host + '/api/users/profile/',
        { headers: header(props.jwt) })
        .then(res => {
            if (res && res.ok)
                return (res.json());
            setErrorCode(res.status);
        })
        .then(res => {
          if (res)
            props.setUsername(res.username)
          setLoad(true);
        })
        .catch(e=>console.log(e));
      }
    }
    login();
  }, [props.jwt, props.username]);
  //if first connection, redirect to /first-connection
  //also need to wait for username to be updated, so make a new function hook
  useEffect(() => {
    if (props.jwt && load === true
      && (props.username === "" || props.username === null)) {
        console.log("navigate");
        navigate("/first-connection");
    }
  }, [props.username, load])
  if (errorCode >= 400)
        return (<FetchError code={errorCode} />);
  return (<></>);
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
      jwt: null,
      username: null,
      userId: null
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

  const getUsername = () => {
    return (user?.username);
  }

  const setUsername = (username: string) => {
    setUser({
      jwt: user.jwt,
      username: username,
      userId: user.userId
    });
  }

  const context = {
    user: user,
    loginUser: loginUser,
    logoutUser: logoutUser,
    getJwt: getJwt,
    getUserId: getUserId,
    getUsername: getUsername,
    setUsername: setUsername
  };

  return (
    <UserContext.Provider value={context}>
      {props.children}
    </UserContext.Provider>
  );
}

export default UserContext;
