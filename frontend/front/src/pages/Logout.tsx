import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from "../contexts/UserContext";

const LogOut = () => {
    const navigate = useNavigate();
    const userCtx: any = useContext(UserContext);

    useEffect(() => {
        userCtx.logoutUser();
        navigate("/login");
    }, [])
}

export default LogOut;