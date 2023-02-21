import React from "react";
import classes from "./buttons.module.css";
import { Link } from "react-router-dom";

interface LoginButtonProps {
    url: string;
}

export function LoginButton(props: LoginButtonProps) {
    const { url } = props;

    return (
        <a href={url}>
            <button className={classes.button1}>LOGIN WITH 42</button>
        </a>
    );
}

export const FakeLoginButton = () => {
    return (<Link className={classes.button1} to={{ pathname: "/fake-login/" }}>Fake Login</Link>);
}

export default LoginButton;