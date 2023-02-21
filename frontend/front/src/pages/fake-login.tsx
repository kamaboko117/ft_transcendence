import React, { useEffect, useState, useContext } from "react";
import UserItem from "../components/Users/UserItem";
import UserContext from "../contexts/UserContext";

function FakeLogin() {
  const userCtx: any = useContext(UserContext);
  const [jwt, setJwt] = useState<null | string>(null);
  const [errorCode, setErrorCode] = useState<number>(200);

  useEffect(() => {
    //gets existing user from database if exists. If not, returns [false, <42id>]
    const getUser = () => {
      return (fetch('http://' + location.host + '/api/users/fake-login').then(response => {
        if (response.ok)
          return (response.json())
        setErrorCode(response.status);
      }));
    };
    getUser().then(res => {
      console.log(res);
      if (typeof res != "undefined")
        setJwt(res.access_token);
    })
  }, []);
  console.log(userCtx);
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

export default FakeLogin;
