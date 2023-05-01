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

export const SocketProvider = (props: { jwt: string | null, usrSocket: Socket<any, any> | undefined, children: any }) => {
    //const navigate = useNavigate();
    const context: typeSocket = {
        usrSocket: props.usrSocket
    }
    const [errorCode, setErrorCode] = useState<number>(200);

    useEffect(() => {
        console.log(props.usrSocket?.connected)
        //if (props.jwt && props.jwt != "" && props.usrSocket && props.usrSocket.connected === false)
        //   navigate("/logout");
        if (props.jwt && props.jwt != ""
            && props.usrSocket?.connected === true) {
            props.usrSocket?.on('exception', (res: any) => {
                if (res && res.status === "error" && res.message === "Token not valid") {
                    setErrorCode(403)
                }
                else {
                    setErrorCode(500);
                }
            });
        }
        return (() => {
            //props.usrSocket?.off('inviteGame');
            props.usrSocket?.off('exception');
            //if (props.usrSocket?.connected === true)
            //  props.usrSocket?.disconnect();
        });
    }, [props.usrSocket?.connected, props.jwt]);

    return (
        <SocketContext.Provider value={context}>
            {errorCode && errorCode >= 400 && <FetchError code={errorCode} />}
            {props.children}
        </SocketContext.Provider>
    )
}
export default SocketContext;


