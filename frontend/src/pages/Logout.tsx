import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import ContextDisplayChannel from '../contexts/DisplayChatContext';
import UserContext from "../contexts/UserContext";

const LogOut = () => {
    const navigate = useNavigate();
    const userCtx: any = useContext(UserContext);
    const { setDisplay } = useContext(ContextDisplayChannel);

    useEffect(() => {
        setDisplay(false);
        userCtx.logoutUser();
        navigate("/login");
    }, [])
    return (<></>);
}

export default LogOut;