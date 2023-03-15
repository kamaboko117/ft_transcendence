import React from 'react';
import { defaultMethod } from 'react-router-dom/dist/dom';
import { lstMsg } from '../components/Chat/Chat';

export type typeListUser = {
    listUser: Array<{
        list_user_user_id: number,
        list_user_role: string | null,
        fl: number | null,
        bl: number | null,
        User_username: string,
    }>
}
type contextDisplay = {
    renderDirectMessage: boolean,
    userId: number,
    id: string,
    lstMsgChat: lstMsg[],
    lstMsgPm: lstMsg[],
    lstUserChat: typeListUser["listUser"],
    lstUserPm: typeListUser["listUser"],
    setDisplay: React.Dispatch<React.SetStateAction<boolean>>,
    setUserId: React.Dispatch<React.SetStateAction<number>>,
    setId: React.Dispatch<React.SetStateAction<string>>,
    setLstMsgChat: React.Dispatch<React.SetStateAction<lstMsg[]>>,
    setLstMsgPm: React.Dispatch<React.SetStateAction<lstMsg[]>>,
    setLstUserChat: React.Dispatch<React.SetStateAction<typeListUser["listUser"]>>
    setLstUserPm: React.Dispatch<React.SetStateAction<typeListUser["listUser"]>>
}

const defaultValue = () => { }

const ContextDisplayChannel = React.createContext<contextDisplay>({
    renderDirectMessage: false,
    userId: 0,
    id: "",
    lstMsgChat: [] as lstMsg[],
    lstMsgPm: [] as lstMsg[],
    lstUserChat: [] as typeListUser["listUser"],
    lstUserPm: [] as typeListUser["listUser"],
    setDisplay: defaultValue,
    setUserId: defaultValue,
    setId: defaultValue,
    setLstMsgChat: defaultValue,
    setLstMsgPm: defaultValue,
    setLstUserChat: defaultValue,
    setLstUserPm: defaultValue
});

export default ContextDisplayChannel;