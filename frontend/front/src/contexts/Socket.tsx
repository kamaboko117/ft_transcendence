import io, { Socket } from 'socket.io-client';
import React, { createContext, Dispatch, useEffect, useState } from 'react';

//const token: string | null = localStorage.getItem("ft_transcendence_gdda_jwt");;

export let usrSocket = io("http://" + location.host, {
    withCredentials: true,
    extraHeaders: {
        authorization: ""
    }
});

type typeSocket = {
    setToken: Dispatch<React.SetStateAction<string | null> >,
    usrSocket: Socket<any, any>
}

const defaultValue = () => {}

const SocketContext = createContext<typeSocket>({
    setToken: defaultValue,
    usrSocket: usrSocket
});

export const SocketProvider = (props: any) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem("ft_transcendence_gdda_jwt"))
    const context: typeSocket = {
        setToken: setToken,
        usrSocket: usrSocket
    }
    useEffect(() => {
        usrSocket = io("http://" + location.host, {
            withCredentials: true,
            extraHeaders: {
                authorization: String(token)
            }
        });
    }, [token])
    return (
        <SocketContext.Provider value={context}>
            {props.children}
        </SocketContext.Provider>
    )
}
export default SocketContext;


