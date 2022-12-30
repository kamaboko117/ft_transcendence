import React from "react";

function LoginButton(props: LoginButtonProps) {
    const { url } = props;

    return (
        <a href={url}>
            <button>Log In</button>
        </a>
    );
}
export default LoginButton;
interface LoginButtonProps {
    url: string;
}