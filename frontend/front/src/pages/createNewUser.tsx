import React from 'react';
import NewUserForm from '../components/Users/NewUserForm';
import { useContext } from "react";
import UserContext from "../store/user-context";
import MainPage from './mainPage';

function CreateNewUser(props: any) {
    const userCtx: any = useContext(UserContext);
    const loginUser = userCtx.loginUser;
    const response = props.props;
    console.log(response);
    function AddUserHandler(username: string) {
        console.log(`user ID: ${response[1]}`);
        fetch("http://localhost:4000/users/create", {
            method: "POST",
            body: JSON.stringify({
                userID: response[1],
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
                loginUser(data);
                localStorage.setItem("user", JSON.stringify(data));
            });
    }
    if (userCtx.user.username) {

        console.log(userCtx.user.username);
        return <MainPage />;
    }
    return (
        <NewUserForm onAddUser={AddUserHandler}/>
    )
}

export default CreateNewUser;