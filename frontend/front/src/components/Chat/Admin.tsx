import React, { useEffect, useState } from 'react';
import { FetchError, header, headerPost } from '../FetchError';

type typeUserInfo = {
    username: string,
    role: string
}

type AdminCompType = {
    id: string,
    userId: number,
    jwt: string,
    chooseClassName: string,
    setErrorCode: React.Dispatch<React.SetStateAction<number>>,
    userInfo: typeUserInfo
}

/*
    Owner part:
        Nommer utilisateur admin
        ne dois pas oublier, lorsque owner quitte un channel, un user est nommé owner, si possible admin
        ptete un bouton nommer utilisateur owner
    Admin part:
        Bannir(durée déterminée)/ kick (durée temps actuel kick == dékick) / mute (durée déterminée), mais pas les owners
*/

const handleClick = (event: React.MouseEvent<HTMLButtonElement>, 
    action: string, jwt) => {
    const e: HTMLElement = event.target as HTMLElement;

    fetch('', {
        method: 'post',
        headers: headerPost(jwt),
        body: JSON.stringify({
            action: action
        })
    })
}

const GrantAdmin = (props: {role: string, jwt: string}) => {
    const privilege = (props.role !== "Administrator" ? "Grant" : "Remove");

    return (<button onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
        handleClick(e, privilege, props.jwt)} className="adminInfoUser">
            { privilege } admin privileges
        </button>);
}

const BanUser = () => {
    return (<button className="adminInfoUser">Ban user</button>);
}

const MuteUser = () => {
    return (<button className="adminInfoUser">Mute user</button>);
}

const KickUser = () => {
    return (<button className="adminInfoUser">Kick user</button>);
}


const AdminButtons = (props: {role: string, focusUserId: number,
    userId: number | undefined, userInfo: typeUserInfo, jwt: string }) => {
    const role: string = props.role;
    let haveAdminGrant: boolean = false;

    if (role === "Owner" || role === "Administrator")
        haveAdminGrant = true;
    if (!props.userId
        || props.focusUserId == props.userId
        || !role || props.userInfo.role === "Owner")
        return (<></>);
    return (
        <>
            {role && role === "Owner" && <GrantAdmin role={props.userInfo.role} jwt={props.jwt} />}
            {haveAdminGrant && <BanUser/>}
            {haveAdminGrant && <MuteUser/>}
            {haveAdminGrant && <KickUser/>}
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
                && <AdminButtons focusUserId={props.userId}
                        userId={userId} role={role} userInfo={props.userInfo} jwt={props.jwt} />}
        </>
    );
}

export default AdminComponent;