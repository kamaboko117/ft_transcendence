import React, { MouseEvent, useCallback, useContext, useEffect, useState } from 'react';
import { FetchError, header } from '../FetchError';
import { useEventListenerUserInfo } from '../../useHook/useEventListener'
import "../../css/channel.css";
import "../../css/chat.css";
import "../../css/user.css"
import scroll from 'react-scroll';
import SocketContext from '../../contexts/Socket';
import { debounce } from 'debounce';
import ContextDisplayChannel from '../../contexts/displayChat';
import AdminComponent from './Admin';

type typeUserInfo = {
    username: string,
    role: string
}

type PropsUserInfo = {
    listUser: Array<{
        user_id: number,
        role: string,
        user: {username: string},
    }>,
    jwt: string,
    id: string,
    setErrorCode: React.Dispatch<React.SetStateAction<number>>
}

type typeButtonsInfo = {
    id: string,
    chooseClassName: string,
    renderDirectMessage: boolean,
    setDisplay: React.Dispatch<React.SetStateAction<boolean>>,
    setId: React.Dispatch<React.SetStateAction<string>>,
    setErrorCode: React.Dispatch<React.SetStateAction<number>>,
    userId: number,
    jwt: string,
    userInfo: typeUserInfo
}

const blockUnblock = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
}
const inviteGame = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
}
const userProfile = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
}

/*
    fetch to backend
    find both user id (user id is in the token)
    find PM from both user
    setId
    DirectMessage component will load messages itself
*/
const directMessage = (event: MouseEvent<HTMLButtonElement>,
    renderDirectMessage: boolean, setDisplay: any, setId: React.Dispatch<React.SetStateAction<string>>,
    setErrorCode: React.Dispatch<React.SetStateAction<number>>,
    userId: number, jwt: string): void => {
    event.preventDefault();

    fetch('http://' + location.host + '/api/chat/private-messages?' + new URLSearchParams({
        id: String(userId),
    }), { headers: header(jwt) })
    .then(res => {
        if (res.ok)
            return (res.text());
        setErrorCode(res.status)
    }).then((res: string | undefined) => {
        if (res)
        {
            setDisplay(true);
            setId(res);
        }
    });
}

const handleClick = (event: React.MouseEvent<HTMLDivElement>,
    userInfo: typeUserInfo,
    setUserInfo: React.Dispatch<React.SetStateAction<typeUserInfo>>,
    setUserId: any, setTop: any): void => {
    event.preventDefault();
    const e: HTMLElement = event.target as HTMLElement;
    const name: string = e.textContent as string;
    const attributes: NamedNodeMap = e.attributes as NamedNodeMap;
    const parentNode: HTMLElement = e.parentNode as HTMLElement;

    if (userInfo.username === "" || userInfo.username != name) {
        setUserId(Number(attributes[0].value));
        if (attributes.length === 2)
            setUserInfo({username: name, role: attributes[1].value});
        else
        setUserInfo({username: name, role: ""});
    }
    else {
        setUserId(0);
        setUserInfo({username: "", role: ""})
    }
    setTop(parentNode.offsetTop);
}

const ButtonsInfos = (props: typeButtonsInfo) => {
    return (<>
        <button onClick={blockUnblock} className="userInfo">Block/Unblock</button>
        <button onClick={inviteGame} className="userInfo">Invite to a game</button>
        <button onClick={userProfile} className="userInfo">User Profile</button>
        <button onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
            directMessage(e, props.renderDirectMessage, props.setDisplay,
                props.setId, props.setErrorCode,
                props.userId, props.jwt)
        } className="userInfo">Direct message</button>
        <AdminComponent
            id={props.id} userId={props.userId} jwt={props.jwt} chooseClassName={props.chooseClassName}
                setErrorCode={props.setErrorCode} userInfo={props.userInfo} />
    </>)
}

/* useCallback allow to cache functions between re-render */

const UserInfo = (props: PropsUserInfo): JSX.Element => {
    const [userInfo, setUserInfo] = useState<typeUserInfo>({
        username: "", role:""
    })
    const [offsetTop, setTop] = useState<number>(0);
    const { renderDirectMessage, userId, id, setDisplay, setUserId, setId } = useContext(ContextDisplayChannel);
    const chooseClassName: string = (userInfo.username != "" ? "userInfo userInfoClick" : "userInfo");
    let i: number = 0;
    const Element = scroll.Element;

    const handleListenerClick = () => {
        setUserInfo({username: "", role: ""});
    }
    //Read React's reference doc
    const ref: any = useEventListenerUserInfo(handleListenerClick);
    //need callback otherwise useEffect will add X time function and will bug
    const callback = useCallback(
        debounce(function resizeFunction() {
            if (userInfo.username != "") {
                const top = ref.current?.childBindings?.domNode?.offsetTop;
                if (typeof top !== "undefined")
                    setTop(top);
            }
        }, 100), [userInfo.username]
    );
    //For resize the info user Box
    useEffect(() => {
        window.addEventListener("resize", callback);
        return () => {
            window.removeEventListener("resize", callback);
        }
    }, [userInfo.username, window.innerWidth, window.innerHeight]);
    return (
        <>
            <Element name="container" className="element fullBoxListUser" ref={ref}
                onClick={(e: React.MouseEvent<HTMLDivElement>) => handleClick(e, userInfo, setUserInfo,
                    setUserId, setTop)}>
                {props.listUser &&
                    props.listUser.map((usr) => (
                        <span data-user-id={usr.user_id}
                            data-role={usr.role}
                            key={++i}>{usr.user.username}</span>
                    ))
                }
            </Element >
            <div className={chooseClassName} style={{ top: offsetTop }}>
                <label className="userInfo">{userInfo.username}</label>
                <ButtonsInfos id={props.id} chooseClassName={chooseClassName}
                    renderDirectMessage={renderDirectMessage} setDisplay={setDisplay}
                    setId={setId} setErrorCode={props.setErrorCode}
                    userId={userId} jwt={props.jwt} userInfo={userInfo} />
            </div>
        </>
    );
}

/* socket.on pour ecouter les user qui rejoignent le chat et les afficher */
/*
    admin et owner doit pouvoir mute/ban
    owner doit pouvoir mettre des gens admin
    quand admin quitte, quelqu'un devient owner, si possible un admin
    user doit pouvoir blockUnblock inviteGame userProfile directMessage
*/

const ListUser = (props: { id: string, jwt: string }) => {
    const { usrSocket } = useContext(SocketContext);
    const [errorCode, setErrorCode] = useState<number>(200);
    const [lstUser, setLstUser] = useState<PropsUserInfo["listUser"]>(Array);

    useEffect(() => {
        const fetchListUser = async (id: string, jwt: string, setErrorCode: any) => {
            return (await fetch('http://' + location.host + '/api/chat/users?' + new URLSearchParams({
                id: id,
            }), { headers: header(jwt) }).then(res => {
                if (res.ok)
                    return (res.json());
                setErrorCode(res.status);
            }));
        }
        fetchListUser(props.id, props.jwt, setErrorCode).then(res => {
            setLstUser(res);
        });
        usrSocket.on("updateListChat", (res: boolean) => {
            fetchListUser(props.id, props.jwt, setErrorCode).then(res => {
                setLstUser(res);
            });
        });
        console.log("list user mount");
        return (() => {
            console.log("list user unmount");
            setLstUser([]);
            usrSocket.off("updateListChat");
        });
    }, [lstUser?.keys]);
    if (errorCode >= 400) // a placer devant fonctions asynchrones semblerait t'il, le composant react se recharge
        return (<FetchError code={errorCode} />); //lorsqu'il se met a jour, semblerait t'il
    return (
        <React.Fragment>
            <h2>List users</h2>
            <UserInfo id={props.id} listUser={lstUser} jwt={props.jwt}
                setErrorCode={setErrorCode} />
        </React.Fragment>
    );
}

export default ListUser;