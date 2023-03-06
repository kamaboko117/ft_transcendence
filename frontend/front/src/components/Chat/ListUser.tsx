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
//import useDisplayChat from '../../useHook/useDisplayChat';

type State = {
    userInfoDisplay: boolean,
    userName: string,
    listUser: Array<{
        id: number,
        content: string,
    }>
}

type PropsUserInfo = {
    listUser: Array<{
        user_id: number,
        user: { username: string },
    }>,
    jwt: string,
    id: string
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
    userId: number, jwt: string): void => {
    event.preventDefault();
    //if (renderDirectMessage === true)
    //    setDisplay(false)
    //else {
    fetch('http://' + location.host + '/api/chat/private-messages?' + new URLSearchParams({
        id: String(userId),
    }), { headers: header(jwt) })
    .then(res => {
        if (res.ok){
            return (res.text());
        }
    }).then((res: string | undefined) => {
        if (res)
        {
            setDisplay(true);
            setId(res);
        }
    });
}

const handleClick = (event: React.MouseEvent<HTMLDivElement>,
    username: string, setUsername: any, setUserId: any, setTop: any): void => {
    event.preventDefault();
    const e: HTMLElement = event.target as HTMLElement;
    const name: string = e.textContent as string;
    const attributes: NamedNodeMap = e.attributes as NamedNodeMap;
    const parentNode: HTMLElement = e.parentNode as HTMLElement;
    if (username === "" || username != name) {
        setUserId(Number(attributes[0].value));
        setUsername(name);
    }
    else {
        setUserId(0);
        setUsername("");
    }
    setTop(parentNode.offsetTop);
}

const UserInfo = (props: PropsUserInfo): JSX.Element => {
    const [username, setUsername] = useState<string>("");
    const [offsetTop, setTop] = useState<number>(0);
    const { renderDirectMessage, userId, id, setDisplay, setUserId, setId } = useContext(ContextDisplayChannel);
    const chooseClassName: string = (username != "" ? "userInfo userInfoClick" : "userInfo");
    let i: number = 0;
    const Element = scroll.Element;

    const handleListenerClick = () => {
        setUsername("");
    }
    //Read React's reference doc
    const ref: any = useEventListenerUserInfo(handleListenerClick);
    //need callback otherwise useEffect will add X time function and will bug
    const callback = useCallback(
        debounce(function resizeFunction() {
            if (username != "") {
                const top = ref.current?.childBindings?.domNode?.offsetTop;
                if (typeof top !== "undefined")
                    setTop(top);
            }
        }, 100), [username]
    );
    //For resize the info user Box
    useEffect(() => {
        window.addEventListener("resize", callback);
        return () => {
            window.removeEventListener("resize", callback);
        }
    }, [username, window.innerWidth, window.innerHeight]);
    //const [, refOne, ] = useDisplayChat();
    return (
        <>
            <Element name="container" className="element fullBoxListUser" ref={ref}
                onClick={(e: React.MouseEvent<HTMLDivElement>) => handleClick(e, username, setUsername,
                    setUserId, setTop)}>
                {props.listUser &&
                    props.listUser.map((usr) => (
                        <span tabIndex={usr.user_id} key={++i}>{usr.user.username}</span>
                    ))
                }
            </Element >
            <div className={chooseClassName} style={{ top: offsetTop }}>
                <label className="userInfo">{username}</label>
                <button onClick={blockUnblock} className="userInfo">Block/Unblock</button>
                <button onClick={inviteGame} className="userInfo">Invite to a game</button>
                <button onClick={userProfile} className="userInfo">User Profile</button>
                <button onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                    directMessage(e, renderDirectMessage, setDisplay, setId,
                        userId, props.jwt)
                } className="userInfo">Direct message</button>
            </div>
        </>
    );
}

/*
    userInfoDisplay: false,
            userName: '',
            listUser: [{
                id: 0,
                content: 'abc'
            }, {
                id: 0,
                content: 'def'
            }],
*/

/*
listUser: Array<{
        id: number,
        username: string,
    }>
*/

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
            <UserInfo id={props.id} listUser={lstUser} jwt={props.jwt} />
        </React.Fragment>
    );
}

export default ListUser;