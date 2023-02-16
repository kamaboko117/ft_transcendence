import io from 'socket.io-client';
import { createContext } from 'react';

const token = localStorage.getItem("ft_transcendence_gdda_jwt");;

export const usrSocket = io("http://" + location.host, {
    withCredentials: true,
    query: { token }
});
export const SocketContext = createContext(usrSocket);
