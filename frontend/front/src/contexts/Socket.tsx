import io, { Socket } from 'socket.io-client';
import React, { createContext, Dispatch, useEffect, useState } from 'react';
import { FetchError} from '../components/FetchError';
//const token: string | null = localStorage.getItem("ft_transcendence_gdda_jwt");;

export let usrSocket = io("http://" + location.host, {
    withCredentials: true,
    extraHeaders: {
        authorization: ""
    }
});

type typeSocket = {
    setToken: Dispatch<React.SetStateAction<string | null> >,
    usrSocket: Socket<any, any>,
}

const defaultValue = () => {}

const SocketContext = createContext<typeSocket>({
    setToken: defaultValue,
    usrSocket: usrSocket,
});

export const SocketProvider = (props: any) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem("ft_transcendence_gdda_jwt"))
    const context: typeSocket = {
        setToken: setToken,
        usrSocket: usrSocket
    }
    const [errorCode, setErrorCode] = useState<number>(200);
    useEffect(() => {
        usrSocket = io("http://" + location.host, {
            withCredentials: true,
            extraHeaders: {
                authorization: String(token)
            }
        });
        usrSocket.on('exception', (res) => {
            if (res.status === "error" && res.message === "Token not valid"){
                setErrorCode(403)
                console.log("Token not valid");
            }
            else
            {
                console.log("Fatal Error");
                setErrorCode(500);
            }
        })
    }, [token]);
    
    return (
        <SocketContext.Provider value={context}>
            {errorCode && errorCode >= 400 && <FetchError code={errorCode} />}
            {props.children}
        </SocketContext.Provider>
    )
}
export default SocketContext;


