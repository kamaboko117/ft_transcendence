import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from "../contexts/UserContext";
import ContextDisplayChannel from '../contexts/displayChat';

export const FetchError = (props: { code: number }) => {
    const navigate = useNavigate();
    const userCtx: any = useContext(UserContext);
    const { renderDirectMessage, userId, setDisplay, setUserId } = useContext(ContextDisplayChannel);
    useEffect(() => {
        if (props.code === 403 || props.code === 401) {
            setDisplay(false);
            userCtx.logoutUser();
            navigate("/logout");
        }
        else if (props.code >= 400)
        {
            try {
                throw new Error('Error ' + props.code);
            } catch (e) {
                navigate("/error-page", { state: {code: props.code} });
            }
        }
            
    }, [])
    return (<></>);
}

export const header = (jwt: Readonly<string | null>) => {
    const header = new Headers({
        Authorization: 'Bearer ' + jwt
    })
    return (header);
};

export const headerPost = (jwt: Readonly<string | null>) => {
    const header = new Headers({
	'Content-Type': 'application/json',
        Authorization: 'Bearer ' + jwt
    })
    return (header);
};
