import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import UserItem from "../components/Users/UserItem";
//gets existing user from database if exists. If not, creates a new user
const getUser = async (code: String | null) => {
    const response = await fetch(`http://0.0.0.0:5000/users/validate/${code}`);
    return await response.json();
};

type User = {
    id: number;
    username: string;
    email: string;
    password: string;
};

function ValidatePage() {
    const [searchParams] = useSearchParams();
    const code = searchParams.get("code");
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser]: [User, any] = useState({
        id: 0,
        username: "",
        email: "",
        password: "",
    });

    useEffect(() => {
        getUser(code).then((data) => {
            setUser(data);
            setIsLoading(false);
        });
    }, []);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Logged as</h1>
            <UserItem
                id={String(user.id)}
                username={user.username}
                email={user.email}
                password={user.password}
            />
        </div>
    );
}

export default ValidatePage;
