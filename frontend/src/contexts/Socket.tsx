import { Socket } from 'socket.io-client';
import React, { createContext, useEffect, useState } from 'react';
import { FetchError } from '../components/FetchError';

type typeSocket = {
    usrSocket: Socket<any, any> | undefined,
}

const defaultValue: any = () => { }

const SocketContext = createContext<typeSocket>({
    usrSocket: defaultValue,
});

export const SocketProvider = (props: { jwt: string, usrSocket: Socket<any, any> | undefined, children: any }) => {
    const context: typeSocket = {
        usrSocket: props.usrSocket
    }
    const [errorCode, setErrorCode] = useState<number>(200);

    useEffect(() => {
        if (props.jwt) {
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


