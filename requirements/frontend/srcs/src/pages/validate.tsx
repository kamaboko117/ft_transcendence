import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import UserItem from "../components/Users/UserItem";
import NewUserForm from "../components/Users/NewUserForm";

//gets existing user from database if exists. If not, creates a new user
const getUser = async (code: String | null) => {
    const response = await fetch(
        `http://localhost:5000/users/validate/${code}`
    );
    return await response.json();
};

// type User = {
//     id: number;
//     username: string;
//     email: string;
//     password: string;
// };

function ValidatePage() {
    const [searchParams] = useSearchParams();
    const code = searchParams.get("code");
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser]: [[boolean, any], any] = useState([
        false,
        {
            id: 0,
            username: "",
            email: "",
            password: "",
        },
    ]);

    useEffect(() => {
        getUser(code).then((data) => {
            console.log(`data: ${data}`)
            setUser(data);
            setIsLoading(false);
        });
    }, [code]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    function AddUserHandler(username: string) {
        console.log(`user ID: ${user[1]}`);
        fetch("http://localhost:5000/users/create", {
            method: "POST",
            body: JSON.stringify({
                userID: user[1],
                username: username,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                console.log(data);
                setUser([true, data]);
            });
    }
    if (!user[0]) {
        return <NewUserForm onAddUser={AddUserHandler} />;
    }

    return (
        <div>
            <h1>Logged as</h1>
            <UserItem
                userID={user[1].userID}
                username={user[1].username}
            />
        </div>
    );
}

export default ValidatePage;
