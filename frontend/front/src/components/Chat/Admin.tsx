import React, { useEffect, useState } from 'react';
import { FetchError, header, headerPost } from '../FetchError';

type typeUserInfo = {
    username: string,
    role: string | null
}

type AdminCompType = {
    id: string,
    userId: number,
    jwt: string,
    chooseClassName: string,
    setErrorCode: React.Dispatch<React.SetStateAction<number>>,
    userInfo: typeUserInfo
}

type typeShortProps = {
    channelId: string,
    role: string | null,
    jwt: string,
    focusUserId: number
}

const handleClick = (event: React.MouseEvent<HTMLButtonElement>, channelId: string,
    action: string, jwt: string, userId: number) => {
    const e: HTMLElement = event.target as HTMLElement;

    fetch('http://' + location.host + '/api/chat-role/role-action', {
        method: 'post',
        headers: headerPost(jwt),
        body: JSON.stringify({
            id: channelId, action: action, time: 0, userId: userId
        })
    })
}

/*
    Owner part:
        Nommer utilisateur admin
        ne dois pas oublier, lorsque owner quitte un channel, un user est nommé owner, si possible admin
        ptete un bouton nommer utilisateur owner
    Admin part:
        Bannir(durée déterminée)/ kick (durée temps actuel kick - cur == dékick) / mute (durée déterminée), mais pas les owners
*/

const GrantAdmin = (props: {shortPropsVariable: typeShortProps}) => {
    //Need to load current chosen user privilege
    const values = props.shortPropsVariable;
    const privilege = (values.role !== "Administrator" ? "Grant" : "Remove");

    return (<button onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
        handleClick(e, values.channelId, privilege,
            values.jwt, values.focusUserId)} className="adminInfoUser">
            { privilege } admin privileges
        </button>);
}

const handleBan = (event: React.MouseEvent<HTMLButtonElement>,
    setTime: React.Dispatch<React.SetStateAction<string>>, time: string) => {
    const target: HTMLElement = event.target as HTMLElement;

    if (target && time === "-1")
        setTime("0");
    else
        setTime("-1");
}

const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const target: HTMLElement = event.target as HTMLElement;
}

const BanUser = () => {
    const [time, setTime] = useState<string>("-1");

    if (Number(time) >= 0)
        return (<>
            <button onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                handleBan(e, setTime, time)} className="adminInfoUser">Ban user</button>
            <form className='adminBox' onSubmit={handleSubmit}>
                <input type="text" onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setTime(e.currentTarget.value)}/>
            </form>
        </>
        );
    return (<button onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
        handleBan(e, setTime, time)} className="adminInfoUser">Ban user</button>);
}

const MuteUser = () => {
    return (<button className="adminInfoUser">Mute user</button>);
}

const KickUser = () => {
    return (<button className="adminInfoUser">Kick user</button>);
}



const AdminButtons = (props: {id: string, role: string | null, focusUserId: number,
    userId: number | undefined, userInfo: typeUserInfo, jwt: string }) => {
    const role: string | null = props.role;
    let haveAdminGrant: boolean = false;
    const shortPropsVariable = {
        channelId: props.id,
        role: props.userInfo.role,
        jwt: props.jwt,
        focusUserId: props.focusUserId
    }
    if (role === "Owner" || role === "Administrator")
        haveAdminGrant = true;
    if (!props.userId
        || props.focusUserId == props.userId
        || !role || props.userInfo.role === "Owner")
        return (<></>);
    return (
        <>
            {role && role === "Owner" && <GrantAdmin shortPropsVariable={shortPropsVariable} />}
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
                && <AdminButtons id={props.id} focusUserId={props.userId}
                        userId={userId} role={role} userInfo={props.userInfo} jwt={props.jwt} />}
        </>
    );
}

export default AdminComponent;