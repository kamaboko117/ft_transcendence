import io from 'socket.io-client';
import { createContext } from 'react';

const token: string | null = localStorage.getItem("ft_transcendence_gdda_jwt");;

export const usrSocket = io("http://" + location.host, {
    withCredentials: true,
    extraHeaders: {
        authorization: String(token)
    }
    //transports: ['websocket', 'polling', 'flashsocket'],
    //auth: {
    //    token: token
    //}
});
export const SocketContext = createContext(usrSocket);
