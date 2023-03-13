import React from 'react';
import { lstMsg } from '../components/Chat/Chat';

type contextDisplay = {
    renderDirectMessage: boolean,
    userId: number,
    id: string,
    lstMsgChat: lstMsg[],
    lstMsgPm: lstMsg[],
    setDisplay: React.Dispatch<React.SetStateAction<boolean>>,
    setUserId: React.Dispatch<React.SetStateAction<number>>
    setId: React.Dispatch<React.SetStateAction<string>>,
    setLstMsgChat:  React.Dispatch<React.SetStateAction<lstMsg[]>>
    setLstMsgPm:  React.Dispatch<React.SetStateAction<lstMsg[]>>
}

const defaultValue = () => { }

const ContextDisplayChannel = React.createContext<contextDisplay>({
    renderDirectMessage: false,
    userId: 0,
    id: "",
    lstMsgChat: [] as lstMsg[],
    lstMsgPm: [] as lstMsg[],
    setDisplay: defaultValue,
    setUserId: defaultValue,
    setId: defaultValue,
    setLstMsgChat: defaultValue,
    setLstMsgPm: defaultValue
});

export default ContextDisplayChannel;