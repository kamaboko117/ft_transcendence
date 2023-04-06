import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useContext } from "react";
import UserItem from "../components/Users/UserItem";
import UserContext, { UsernameSet } from "../contexts/UserContext";
import { FetchError } from "../components/FetchError";


const CheckFa = (props: { userCtx, fa: boolean | undefined }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (props.userCtx.getUsername() == "")
      navigate('/first-connection');
    else if (props.fa === true)
      navigate('/fa-code');
    else
      navigate('/');
    //if (props.userCtx.getJwt() != null && props.userCtx.getJwt() !== "") {
      /*if (props.fa === false && props.username == "") {
        console.log("fi")
        navigate('/first-connection');
      }
      else if (props.fa === true) {
        console.log("fa")
        navigate('/fa-code');
      }
      else if (props.fa === false) {
        console.log("home")
        navigate('/');
      }*/
    //}
  }, []);
  return (
    <></>
  );
}

function ValidatePage(props: {jwt: string}) {
  const userCtx: any = useContext(UserContext);
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  //const [jwt, setJwt] = useState<null | string>(null);
  //const [userId, setUserId] = useState<number>(0);
  const [errorCode, setErrorCode] = useState<number>(200);
  //const [username, setUsername] = useState<string>("");
  const [fa, setFa] = useState<boolean | undefined>(undefined);
  //ask load user
  useEffect(() => {
    const getUser = (code: string | null | false) => {
      return (fetch('http://' + location.host + '/api/users/login', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code
        })
      }).then(response => {
        console.log(response)
        if (response.ok)
          return (response.json());
        setErrorCode(response.status);
      }).catch(e => console.log(e)));
    };
    //set load user
    getUser(code).then(res => {
      console.log(res);
      if (typeof res != "undefined") {
        setFa(res.fa);
        userCtx.loginUser({
          jwt: res.token.access_token,
          username: res.username,
          userId: String(res.user_id)
        });
        //setJwt(res.token.access_token);
        //setUserId(res.user_id);
        //setUsername(res.username);
      }
    })
  }, []);
  //const { setToken } = useContext(SocketContext);
  //log user to UserContext
  /*useEffect(() => {
    const login = async () => {
      //set promise otherwise token is not set properly in context
      await userCtx.loginUser({
        jwt: jwt,
        username: username,
        userId: String(userId)
      });
      //setToken(jwt);
    }
    login();
  }, [jwt]);*/
  if (errorCode >= 400)
    return (<FetchError code={errorCode} />);
  //if (typeof jwt != "undefined" && jwt != null) {
  // console.log(userCtx);

  return (
    <div>
      <h1>Logged as</h1>
      {/*jwt && <UsernameSet jwt={String(jwt)} username={username} setUsername={setUsername} />*/}
      {props.jwt && <CheckFa userCtx={userCtx} fa={fa} />}
    </div>
  );
  // }
}

export default ValidatePage;