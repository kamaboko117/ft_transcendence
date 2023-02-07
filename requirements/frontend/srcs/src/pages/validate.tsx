import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useContext } from "react";
import UserItem from "../components/Users/UserItem";
import UserContext from "../store/user-context";
import CreateNewUser from "./createNewUser";

// type User = {
//     id: number;
//     username: string;
//     email: string;
//     password: string;
// };

function ValidatePage() {
  const userCtx: any = useContext(UserContext);
  //query string
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const [isLoading, setIsLoading] = useState(true);
  const [response, setResponse]: [[boolean, any], any] = useState([
    false,
    {
      id: 0,
      username: "",
      email: "",
      password: "",
    },
  ]);
  //gets existing user from database if exists. If not, returns [false, <42id>]
  const getUser = async (code: String | null) => {
    const response = await fetch(`http://localhost:5000/users/validate/${code}`);
    return await response.json();
  };

  useEffect(() => {
    getUser(code).then((data) => {
      console.log(`data: ${data}`);
      setResponse(data);
      setIsLoading(false);
    });
  }, [code]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!response[0]) {
    return <CreateNewUser props={response} />;
  }
  console.log(userCtx.user);
  return (
    <div>
      <h1>Logged as</h1>
      <UserItem userID={userCtx.user.userID} username={userCtx.user.username} />
    </div>
  );
}

export default ValidatePage;
