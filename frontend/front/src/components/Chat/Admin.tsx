import React, { useEffect, useState } from 'react';
import { FetchError, header } from '../FetchError';

type AdminCompType = {
    id: string,
    userId: number,
    jwt: string,
    chooseClassName: string,
    setErrorCode: React.Dispatch<React.SetStateAction<number>>
}

/*
    Owner part:
        Nommer utilisateur admin
        ne dois pas oublier, lorsque owner quitte un channel, un user est nommé owner, si possible admin
        ptete un bouton nommer utilisateur owner
    Admin part:
        Bannir(durée déterminée)/ kick (durée temps actuel kick == dékick) / mute (durée déterminée), mais pas les owners
*/

const GrantAdmin = (props: {role: string}) => {
    return (<button className="adminInfoUser">Grant admin privileges</button>);
}

const AdminButtons = (props: {role: string, focusUserId: number, userId: number | undefined}) => {
    const role: string = props.role;
    if (!props.userId)
        return (<></>);
    return (
        <>
            {role && role === "Owner" && props.focusUserId != props.userId && <GrantAdmin role={role} />}
        </>
    )
}

const AdminComponent = (props: AdminCompType) => {
    const [role, setRole] = useState<string>("");
    const [userId, setUserId] = useState<number>();

    useEffect(() => {
        const getRole = () => {
            fetch('http://' + location.host + '/api/chat-role/getRole?' + new URLSearchParams({
                id: props.id,
            }), { headers: header(props.jwt) })
            .then(res => {
                if (res.ok)
                    return (res.json());
                props.setErrorCode(res.status)
            })
            .then((res) => {
                if (res.role)
                {
                    setUserId(res.userId);
                    setRole(res.role);
                }
                else
                {
                    setUserId(res.userId);
                    setRole("");
                }
            });
        };
        //check if userInfo box is displayed on client
        if (props.chooseClassName === "userInfo userInfoClick")
            getRole();
        return (() => {})
    }, [props.chooseClassName])
    return (
        <>
            {role && (role === "Owner" || role === "Administrator")
                && <AdminButtons focusUserId={props.userId} userId={userId} role={role} />}
        </>
    );
}

export default AdminComponent;