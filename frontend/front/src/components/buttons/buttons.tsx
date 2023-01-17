import React from "react";
import classes from "./buttons.module.css";

function LoginButton(props: LoginButtonProps) {
    const { url } = props;

    return (
        <a href={url}>
            <button className={classes.button1}>LOGIN WITH 42</button>
        </a>
    );
}
export default LoginButton;
interface LoginButtonProps {
    url: string;
}