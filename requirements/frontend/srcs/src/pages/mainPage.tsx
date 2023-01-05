import { useEffect, useState } from "react";
import UserList from "../components/Users/UserList";

function MainPage() {
    const [isLoading, setIsLoading] = useState(true);
    const arr: any = [];
    const [loadedUsers, setLoadedUsers] = useState(arr);
    console.log("d");
    useEffect(() => {
        fetch(`http://localhost:5000/users`, /*{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: "test",
                email: "test@example.com",
                password: "testtest",
            }),
        }*/)
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
