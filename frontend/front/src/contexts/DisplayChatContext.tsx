import React, { useEffect, useContext, useState, useCallback } from 'react';
import { lstMsg } from '../components/Chat/Chat';
import { FetchError, header } from '../components/FetchError';

export type typeListUser = {
    listUser: Array<{
        list_user_user_id: number,
        list_user_role: string | null,
        fl: number | null,
        bl: number | null,
        User_username: string,
        User_avatarPath: string | null
    }>
}

export type typeListUserGlobal = {
    listUser: Array<{
        id: number,
        fl: number | null,
        bl: number | null,
        User_username: string,
        User_avatarPath: string | null
    }>
}

type contextDisplay = {
    renderDirectMessage: boolean,
    userId: number,
    id: string,
    lstMsgChat: lstMsg[],
    lstMsgPm: lstMsg[],
    lstUserChat: typeListUser["listUser"],
    lstUserGlobal: typeListUserGlobal["listUser"],
    setDisplay: React.Dispatch<React.SetStateAction<boolean>>,
    setUserId: React.Dispatch<React.SetStateAction<number>>,
    setId: React.Dispatch<React.SetStateAction<string>>,
    setLstMsgChat: React.Dispatch<React.SetStateAction<lstMsg[]>>,
    setLstMsgPm: React.Dispatch<React.SetStateAction<lstMsg[]>>,
    setLstUserChat: React.Dispatch<React.SetStateAction<typeListUser["listUser"]>>
    setLstUserGlobal: React.Dispatch<React.SetStateAction<typeListUserGlobal["listUser"]>>
}

const defaultValue = () => { }

const ContextDisplayChannel = React.createContext<contextDisplay>({
    renderDirectMessage: false,
    userId: 0,
    id: "",
    lstMsgChat: [] as lstMsg[],
    lstMsgPm: [] as lstMsg[],
    lstUserChat: [] as typeListUser["listUser"],
    lstUserGlobal: [] as typeListUserGlobal["listUser"],
    setDisplay: defaultValue,
    setUserId: defaultValue,
    setId: defaultValue,
    setLstMsgChat: defaultValue,
    setLstMsgPm: defaultValue,
    setLstUserChat: defaultValue,
    setLstUserGlobal: defaultValue
});

export const LoadUserGlobal = (props: { jwt: string }) => {
    const { setLstUserGlobal } = useContext(ContextDisplayChannel);
    const [errorCode, setErrorCode] = useState<number>(200);

    useEffect(() => {
        fetch('http://' + location.host + '/api/users/fr-bl-list', { headers: header(props.jwt) })
            .then(res => {
                if (res.ok)
                    return (res.json());
                setErrorCode(res.status);
            }).then(res => setLstUserGlobal(res));
        return (() => { });
    }, [props.jwt]);
    return (<>{errorCode && errorCode >= 400 && <FetchError code={errorCode} />}</>);
}

type typeFlBl = {
    id: number,
    fl: number | null,
    bl: number | null,
    User_username: string,
    User_avatarPath: string | null
}

export const updateBlackFriendList = (
    user: typeFlBl,
    lstUserGlobal: Array<typeFlBl>,
    setLstUserGlobal: React.Dispatch<React.SetStateAction<Array<typeFlBl>>>
) => {
    const search = () => {
        console.log(lstUserGlobal.length)
        const found = lstUserGlobal.find(elem => Number(elem.id) === user.id);
        console.log(found)
        return (found);
    }
    let didChange: boolean = false;
    if (search()) {
        //update array
        console.log(user);
        const newArr = lstUserGlobal.map((value) => {
            console.log(value)
            if (value && Number(value.id) === user.id) {
                value.bl = user.bl;
                value.fl = user.fl;
                didChange = true;
            }
            return (value);
        });
        setLstUserGlobal(newArr);
    } else if (user.bl == 1 || user.fl == 2) {
        setLstUserGlobal(prev => [...prev, user]);
    }
}

export const DisplayChatGlobalProvider = (props: any) => {
    const [errorCode, setErrorCode] = useState<number>(200);
    const [renderDirectMessage, setDisplay] = useState<boolean>(false);
    const [userId, setUserId] = useState<number>(0);
    const [id, setId] = useState<string>("");
    const [lstMsgChat, setLstMsgChat] = useState<lstMsg[]>([] as lstMsg[]);
    const [lstMsgPm, setLstMsgPm] = useState<lstMsg[]>([] as lstMsg[]);
    const [lstUserChat, setLstUserChat] = useState<typeListUser["listUser"]>(Array);
    const [lstUserGlobal, setLstUserGlobal] = useState<typeListUserGlobal["listUser"]>(Array);
    const providers = {
        renderDirectMessage: renderDirectMessage,
        userId: userId,
        id: id,
        lstMsgChat: lstMsgChat,
        lstMsgPm: lstMsgPm,
        lstUserChat: lstUserChat,
        lstUserGlobal: lstUserGlobal,
        setDisplay: setDisplay,
        setUserId: setUserId,
        setId: setId,
        setLstMsgChat: setLstMsgChat,
        setLstMsgPm: setLstMsgPm,
        setLstUserChat: setLstUserChat,
        setLstUserGlobal: setLstUserGlobal
    };

    return (
        <ContextDisplayChannel.Provider value={providers}>
            {errorCode && errorCode >= 400 && <FetchError code={errorCode} />}
            {props.children}
        </ContextDisplayChannel.Provider>
    );
}

export default ContextDisplayChannel;