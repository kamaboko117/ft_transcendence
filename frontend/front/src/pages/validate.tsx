import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useContext } from "react";
import UserItem from "../components/Users/UserItem";
import UserContext from "../contexts/UserContext";

function ValidatePage() {
  const userCtx: any = useContext(UserContext);
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const [jwt, setJwt] = useState<null | string>(null);
  const [errorCode, setErrorCode] = useState<number>(200);

  useEffect(() => {
    //gets existing user from database if exists. If not, returns [false, <42id>]
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
      if (typeof res != "undefined")
        setJwt(res.access_token);
    })
  }, []);

  useEffect(() => {
    userCtx.loginUser({
      jwt: jwt,
      username: ""
    });
  }, [jwt])
  /*if (isLoading) {
    return <div>Loading...</div>;
  }*/

  /*if (!response[0]) {
    return <CreateNewUser props={response} />;
  }*/

  //console.log(userCtx.user);
  if (typeof jwt != "undefined" && jwt != null) {
    console.log(userCtx);
    return (
      <div>
        <h1>Logged as</h1>
        <UserItem jwt={jwt} /*userID={userCtx.user.userID} username={userCtx.user.username}*/ />
      </div>
    );
  }
  return (<p>Logging user...</p>);
}

export default ValidatePage;
