import { Socket } from 'socket.io-client';
import React, { createContext, Dispatch, useEffect, useState } from 'react';
import { FetchError } from '../components/FetchError';
//const token: string | null = localStorage.getItem("ft_transcendence_gdda_jwt");;

//export let usrSocket: Socket<any, any> | undefined;

type typeSocket = {
    // setToken: Dispatch<React.SetStateAction<string | null>>,
    usrSocket: Socket<any, any> | undefined,
}

const defaultValue: any = () => { }

const SocketContext = createContext<typeSocket>({
    //setToken: defaultValue,
    usrSocket: defaultValue,
});

export const SocketProvider = (props: {jwt: string, usrSocket: Socket<any, any> | undefined, children: any}) => {
    //const [usrSocket, setUsrSocket] = useState<Socket<any, any> | undefined>();
    //const [token, setToken] = useState<string | null>(localStorage.getItem("ft_transcendence_gdda_jwt"))
    const context: typeSocket = {
        //setToken: setToken,
        usrSocket: props.usrSocket
    }
    const [errorCode, setErrorCode] = useState<number>(200);

   /* useEffect(() => {
        //if (props.jwt) {
            console.log("socket mount");
            setUsrSocket(io("http://" + location.host, {
            withCredentials: true,
            extraHeaders: {
                authorization: String(props.jwt)
            },
            autoConnect: false
        }));
    //}
    }, [])*/
    useEffect(() => {
        if (props.jwt) {
            console.log("socket connect")
            props.usrSocket?.connect();
            props.usrSocket?.on('exception', (res) => {
                if (res.status === "error" && res.message === "Token not valid") {
                    setErrorCode(403)
                    console.log("Token not valid");
                }
                else {
                    console.log("Fatal Error");
                    setErrorCode(500);
                }
            });
        }
        return (() => {
            console.log("socket unmount");
            //if (!props.jwt)
            props.usrSocket?.off('inviteGame');
            props.usrSocket?.off('exception');
            props.usrSocket?.disconnect();
        });
    }, [props.jwt, props.usrSocket]);

    return (
        <SocketContext.Provider value={context}>
            {errorCode && errorCode >= 400 && <FetchError code={errorCode} />}
            {props.children}
        </SocketContext.Provider>
    )
}
export default SocketContext;


