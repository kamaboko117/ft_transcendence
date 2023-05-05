import React, { useEffect, useState, useContext } from "react";
import UserContext from "../contexts/UserContext";
import { FetchError } from "../components/FetchError";
import { useNavigate } from "react-router-dom";

const CheckFa = (props: { userCtx: { getUsername: () => string; }, fa: boolean | undefined }) => {
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

function FakeLogin(props: { jwt: string }) {
  const userCtx: any = useContext(UserContext);
  const [errorCode, setErrorCode] = useState<number>(200);
  const [fa, setFa] = useState<boolean | undefined>(undefined);
  useEffect(() => {
    //gets existing user from database if exists. If not, returns [false, <42id>]
    const getUser = () => {
      return (fetch('https://' + location.host + '/api/users/fake-login').then(response => {
        if (response.ok)
          return (response.json());
        setErrorCode(response.status);
      }).catch(e => console.log(e)));
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

  if (errorCode >= 400)
    return (<FetchError code={errorCode} />);

  return (<>
    <p>Logging user...</p>
    {props.jwt && <CheckFa userCtx={userCtx} fa={fa} />}
  </>);
}

export default FakeLogin;
