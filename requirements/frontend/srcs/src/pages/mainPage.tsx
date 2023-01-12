import { useEffect, useState } from "react";
import { useContext } from "react";

import UserList from "../components/Users/UserList";
import UserContext from "../store/user-context";

function MainPage() {
  const [isLoading, setIsLoading] = useState(true);
  const arr: any = [];
  const [loadedUsers, setLoadedUsers] = useState(arr);
  console.log("d");
  const userCtx: any = useContext(UserContext);
  if (userCtx.user.username) {
    console.log("logged in as " + userCtx.user.username);
  }
  useEffect(() => {
    fetch(`http://localhost:5000/users`)
      .then((response) => {
        console.log(response);
        return response.json();
      })
      .then((data) => {
        console.log(data);
        const users = [];
        for (const key in data) {
          const user = {
            id: key,
            ...data[key],
          };
          users.push(user);
        }
        setIsLoading(false);
        setLoadedUsers(users);
      });
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <UserList users={loadedUsers} />
    </div>
  );
}

export default MainPage;
