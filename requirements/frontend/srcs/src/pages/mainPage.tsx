import { useEffect, useState } from "react";
import UserList from "../components/Users/UserList";

function MainPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [loadedUsers, setLoadedUsers] = useState([]);
    console.log("d");
    useEffect(() => {
        fetch(`http://0.0.0.0:5000`/*, {
            method: "POST",
            body: JSON.stringify({
                username: "pouet",
                password: "test",
                email: "email@example.com",
            }),
            headers: {
                "Content-Type": "application/json",
            },d
        }*/)
            .then((response) => {
                console.log(response);
                return response.text();
            })
            .then((data) => {
                console.log(data);
                // setIsLoading(false);
                // setLoadedUsers(data);
            });
    }, []);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>{loadedUsers.toString()}</h1>
        </div>
    );
}

export default MainPage;
