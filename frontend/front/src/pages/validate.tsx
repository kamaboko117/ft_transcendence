import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useContext } from "react";
import UserItem from "../components/Users/UserItem";
import UserContext from "../contexts/UserContext";
import { FetchError } from "../components/FetchError";
import SocketContext from "../contexts/Socket";

function ValidatePage() {
  const userCtx: any = useContext(UserContext);
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const [jwt, setJwt] = useState<null | string>(null);
  const [userId, setUserId] = useState<number>(0);
  const [errorCode, setErrorCode] = useState<number>(200);

  useEffect(() => {
    const getUser = (code: string | null | false) => {
      return (fetch('http://' + location.host + '/api/users/login', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code
        })
      }).then(response => {
        if (response.ok)
          return (response.json())
        setErrorCode(response.status);
      }));
    };
    getUser(code).then(res => {
      console.log(res);
      if (typeof res != "undefined") {
        setJwt(res.token.access_token);
        setUserId(res.user_id);
      }
    })
  }, []);
  const { setToken } = useContext(SocketContext);
  useEffect(() => {
    const login = async () => {
      await userCtx.loginUser({
        jwt: jwt,
        username: "",
        userId: String(userId)
      });
    }
    login();
    setToken(jwt);
  }, [jwt])
  if (errorCode >= 400)
    return (<FetchError code={errorCode} />);
  //if (typeof jwt != "undefined" && jwt != null) {
  // console.log(userCtx);
  return (
    <div>
      <h1>Logged as</h1>
      <UserItem jwt={jwt} /*userID={userCtx.user.userID} username={userCtx.user.username}*/ />
    </div>
  );
  // }
}

export default ValidatePage;
