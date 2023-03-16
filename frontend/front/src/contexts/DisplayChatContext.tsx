import React, { useEffect, useContext, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { lstMsg } from '../components/Chat/Chat';
import { FetchError, header } from '../components/FetchError';

export type typeListUser = {
    listUser: Array<{
        list_user_user_id: number,
        list_user_role: string | null,
        fl: number | null,
        bl: number | null,
        User_username: string,
    }>
}

export type typeListUserGlobal = {
    listUser: Array<{
        id: number,
        fl: number | null,
        bl: number | null,
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

export const UpdateBlackFriendList = (props: {
    user: {
        id: number,
        fl: number | null,
        bl: number | null,
    }
}) => {
    const { lstUserGlobal, setLstUserGlobal } = useContext(ContextDisplayChannel);
    useEffect(() => {
        const search = (props) => {
            const found = lstUserGlobal.find(elem => Number(elem.id) === props.user.id)
            return (found);
        }
        if (search(props)) {
            //update array
            const newArr = lstUserGlobal.map((value) => {
                if (value && value.id === props.user.id) {
                    value.bl = props.user.bl;
                    value.fl = props.user.fl;
                }
                return (value);
            });
            setLstUserGlobal(newArr);
        } else {
            //add at end of array
            setLstUserGlobal(prev => [...prev, props.user]);
        }
    }, [JSON.stringify(props.user)]);
    return (<>
    </>);
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
    //const getLocation = useLocation()?.pathname;
    /*useEffect(() => {
        console.log(getLocation);
        fetch('http://' + location.host + '/api/users/fr-bl-list', { headers: header(props.jwt) })
            .then(res => {
                if (res.ok)
                    return (res.json());
                setErrorCode(res.status);
            }).then(res => console.log(res));
        return (() => { setLstUserGlobal([]) });
    }, [getLocation]);
*/
    return (
        <ContextDisplayChannel.Provider value={providers}>
            {errorCode && errorCode >= 400 && <FetchError code={errorCode} />}
            {props.children}
        </ContextDisplayChannel.Provider>
    );
}

export default ContextDisplayChannel;