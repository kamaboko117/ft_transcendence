import React, { useEffect, useState, useContext } from "react";
import UserContext from "../contexts/UserContext";
import { FetchError } from "../components/FetchError";
import { useNavigate } from "react-router-dom";

const CheckFa = (props: { userCtx, fa: boolean | undefined }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (props.userCtx.getUsername() == "")
      navigate('/first-connection');
    else if (props.fa === true)
      navigate('/fa-code');
    else
      navigate('/');
  }, []);
  return (
    <></>
  );
}

function FakeLogin(props: {jwt: string}) {
  const userCtx: any = useContext(UserContext);
  //const [jwt, setJwt] = useState<null | string>(null);
  //const [userId, setUserId] = useState<number>(0);
  const [errorCode, setErrorCode] = useState<number>(200);
  const [fa, setFa] = useState<boolean | undefined>(undefined);
  useEffect(() => {
    //gets existing user from database if exists. If not, returns [false, <42id>]
    const getUser = () => {
      return (fetch('https://' + location.host + '/api/users/fake-login').then(response => {
        if (response.ok)
          return (response.json());
        setErrorCode(response.status);
      }).catch(e=>console.log(e)));
    };
    getUser().then(res => {
      if (typeof res != "undefined") {
        setFa(res.fa);
        userCtx.loginUser({
          jwt: res.token.access_token,
          username: res.username,
          userId: String(res.user_id)
        });
      }
    })
  }, []);
  //const { setToken } = useContext(SocketContext);
  /*useEffect(() => {
    const login = async () => {
      await userCtx.loginUser({
        jwt: jwt,
        username: "",
        userId: String(userId)
      });
    }
    login();
    //setToken(jwt);
  }, [jwt])*/
  if (errorCode >= 400)
    return (<FetchError code={errorCode} />);
  /*if (typeof jwt != "undefined" && jwt != null) {
    console.log(userCtx);
    return (
      <div>
        <h1>Logged as</h1>
        <UserItem jwt={jwt} /*userID={userCtx.user.userID} username={userCtx.user.username}*/// />
   //   </div>
   // );
  //}
  return (<>
    <p>Logging user...</p>
    {props.jwt && <CheckFa userCtx={userCtx} fa={fa} />}
  </>);
}

export default FakeLogin;
