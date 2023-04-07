import React, { useEffect, useRef, useState } from 'react';
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
type typeFetchToBack = {
    channelId: string,
    action: string,
    jwt: string,
    userId: number,
    option: string
}

const handleClick = (event: React.MouseEvent<HTMLButtonElement>, channelId: string,
    action: string, jwt: string, userId: number) => {
    const e: HTMLElement = event.target as HTMLElement;

    fetch('https://' + location.host + '/api/chat-role/role-action', {
        method: 'post',
        headers: headerPost(jwt),
        body: JSON.stringify({
            id: channelId, action: action, time: "", userId: userId
        })
    }).catch(e => console.log(e));
}

const fetchToBackWithTimer = (elem: typeFetchToBack) => {
    fetch('https://' + location.host + '/api/chat-role/role-action', {
        method: 'post',
        headers: headerPost(elem.jwt),
        body: JSON.stringify({
            id: elem.channelId, action: elem.action,
            option: elem.option, userId: elem.userId
        })
    }).catch(e => console.log(e));
}

/*
    Owner part:
        Nommer utilisateur admin
        ne dois pas oublier, lorsque owner quitte un channel, un user est nommé owner, si possible admin
        ptete un bouton nommer utilisateur owner
    Admin part:
        Bannir(durée déterminée)/ kick (durée temps actuel kick - cur == dékick) / mute (durée déterminée), mais pas les owners
*/

const GrantAdmin = (props: { shortPropsVariable: typeShortProps }) => {
    //Need to load current chosen user privilege
    const values = props.shortPropsVariable;
    const privilege = (values.role !== "Administrator" ? "Grant" : "Remove");

    return (<button onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
        handleClick(e, values.channelId, privilege,
            values.jwt, values.focusUserId)} className="adminInfoUser">
        {privilege} admin privileges
    </button>);
}

const handleBanMute = (event: React.MouseEvent<HTMLButtonElement>,
    setTime: React.Dispatch<React.SetStateAction<string | null>>,
    ref: React.RefObject<HTMLInputElement>,
    time: string | null) => {
    event.preventDefault();
    const target: HTMLElement = event.target as HTMLElement;

    if (target && time === null) {
        setTime("0");
        if (ref && ref.current)
            ref.current.value = "0";
    }
    else {
        setTime(null);
        if (ref && ref.current)
            ref.current.value = "";
    }
}

const handleSubmitBanMute = (event: React.FormEvent<HTMLFormElement>,
    time: string,
    setTime: React.Dispatch<React.SetStateAction<string | null>>,
    ref: React.RefObject<HTMLInputElement>,
    object: typeFetchToBack) => {
    event.preventDefault();
    const target: HTMLElement = event.target as HTMLElement;

    if (!target)
        return;
    if (isNaN(Number(time))) {
        setTime("Not a number");
        if (ref && ref.current)
            ref.current.value = "Not a number";
        return;
    }
    setTime("");
    //fetch (ban) data to backend
    fetchToBackWithTimer({
        channelId: object.channelId,
        action: object.action,
        jwt: object.jwt,
        userId: Number(object.userId),
        option: time
    });
    if (ref && ref.current)
        ref.current.value = "";
}

const BanUser = (props: { shortPropsVariable: typeShortProps }) => {
    const [time, setTime] = useState<string | null>(null);
    const refElem = useRef<HTMLInputElement>(null);
    const object: typeFetchToBack = {
        channelId: props.shortPropsVariable.channelId,
        action: "Ban",
        jwt: props.shortPropsVariable.jwt,
        userId: props.shortPropsVariable.focusUserId,
        option: ""
    }

    useEffect(() => {
        setTime(null);
    }, [props.shortPropsVariable.focusUserId]);
    if (time != null) {
        return (<>
            <button onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                handleBanMute(e, setTime, refElem, time)} className="adminInfoUser">Ban user</button>
            <form className='adminBox' onSubmit={(e: React.FormEvent<HTMLFormElement>) =>
                handleSubmitBanMute(e, time, setTime, refElem, object)}>
                <input ref={refElem} type="text"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setTime(e.currentTarget.value)} />
            </form>
        </>
        );
    }
    return (<button onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
        handleBanMute(e, setTime, refElem, time)} className="adminInfoUser">Ban user</button>);
}

const MuteUser = (props: { shortPropsVariable: typeShortProps }) => {
    const [time, setTime] = useState<string | null>(null);
    const refElem = useRef<HTMLInputElement>(null);
    const object: typeFetchToBack = {
        channelId: props.shortPropsVariable.channelId,
        action: "Mute",
        jwt: props.shortPropsVariable.jwt,
        userId: props.shortPropsVariable.focusUserId,
        option: ""
    }

    useEffect(() => {
        setTime(null);
    }, [props.shortPropsVariable.focusUserId]);
    if (time != null) {
        return (<>
            <button onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                handleBanMute(e, setTime, refElem, time)} className="adminInfoUser">Mute user</button>
            <form className='adminBox' onSubmit={(e: React.FormEvent<HTMLFormElement>) =>
                handleSubmitBanMute(e, time, setTime, refElem, object)}>
                <input ref={refElem} type="text"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setTime(e.currentTarget.value)} />
            </form>
        </>
        );
    }
    return (<button onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
        handleBanMute(e, setTime, refElem, time)} className="adminInfoUser">Mute user</button>);
}

const fetchKick = (event: React.MouseEvent<HTMLButtonElement>,
    object: typeFetchToBack, askKick: boolean) => {
    const target: HTMLElement = event.target as HTMLElement;

    if (!target)
        return;
    if (askKick === true) {
        fetch('https://' + location.host + '/api/chat-role/role-action', {
            method: 'post',
            headers: headerPost(object.jwt),
            body: JSON.stringify({
                id: object.channelId, action: object.action,
                option: object.option, userId: Number(object.userId)
            })
        }).catch(e => console.log(e));
    }

}

const handleKick = (event: React.MouseEvent<HTMLButtonElement>,
    setAskKick: React.Dispatch<React.SetStateAction<boolean>>,
    askKick: boolean) => {
    event.preventDefault();
    const target: HTMLElement = event.target as HTMLElement;

    if (target && askKick === false)
        setAskKick(true);
    else
        setAskKick(false);
}

const AskKick = (props: { askKick: boolean, object: typeFetchToBack }) => {
    return (<button onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
        fetchKick(e, props.object, props.askKick)}>Confirm kick</button>);
}

const KickUser = (props: { shortPropsVariable: typeShortProps }) => {
    const [askKick, setAskKick] = useState<boolean>(false);
    const object: typeFetchToBack = {
        channelId: props.shortPropsVariable.channelId,
        action: "Kick",
        jwt: props.shortPropsVariable.jwt,
        userId: props.shortPropsVariable.focusUserId,
        option: ""
    }

    useEffect(() => {
        setAskKick(false);
    }, [props.shortPropsVariable.focusUserId])
    if (askKick === true) {
        return (<><button onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
            handleKick(e, setAskKick, askKick)} className="adminInfoUser">Kick user</button>
            <AskKick askKick={askKick} object={object} /></>);
    }
    return (<button onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
        handleKick(e, setAskKick, askKick)} className="adminInfoUser">Kick user</button>);
}

const AdminButtons = (props: {
    id: string, role: string | null, focusUserId: number,
    userId: number | undefined, userInfo: typeUserInfo, jwt: string
}) => {
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
            {haveAdminGrant && <BanUser shortPropsVariable={shortPropsVariable} />}
            {haveAdminGrant && <MuteUser shortPropsVariable={shortPropsVariable} />}
            {haveAdminGrant && <KickUser shortPropsVariable={shortPropsVariable} />}
        </>
    )
}

const AdminComponent = (props: AdminCompType) => {
    const [role, setRole] = useState<string>("");
    const [userId, setUserId] = useState<number>();

    useEffect(() => {
        const getRole = () => {
            fetch('https://' + location.host + '/api/chat-role/getRole?' + new URLSearchParams({
                id: props.id,
            }), { headers: header(props.jwt) })
                .then(res => {
                    if (res.ok)
                        return (res.json());
                    props.setErrorCode(res.status)
                })
                .then((res) => {
                    if (res && res.role) {
                        setUserId(res.userId);
                        setRole(res.role);
                    }
                    else {
                        setUserId(0);
                        setRole("");
                    }
                }).catch(e => console.log(e));
        };
        //check if userInfo box is displayed on client
        if (props.chooseClassName === "userInfo userInfoClick")
            getRole();
        return (() => { })
    }, [props.chooseClassName]);
    return (
        <>
            {role && (role === "Owner" || role === "Administrator")
                && <AdminButtons id={props.id} focusUserId={props.userId}
                    userId={userId} role={role} userInfo={props.userInfo} jwt={props.jwt} />}
        </>
    );
}

export default AdminComponent;