import React, { MouseEvent, useCallback, useContext, useEffect, useState } from 'react';
import { FetchError, header, headerPost } from '../FetchError';
import { useEventListenerUserInfo } from '../../useHook/useEventListener'
import "../../css/channel.css";
import "../../css/chat.css";
import "../../css/user.css";
import scroll from 'react-scroll';
import SocketContext from '../../contexts/Socket';
import { debounce } from 'debounce';
import ContextDisplayChannel, { updateBlackFriendList } from '../../contexts/DisplayChatContext';
import AdminComponent from './Admin';
import { useNavigate } from 'react-router-dom';
import { playPageInvite } from '../../pages/PlayInvite';

type typeUserInfo = {
    username: string,
    role: string | null,
    id: number,
    friend: number | null,
    block: number | null,
    avatarPath: string | null
}

type typeListUser = {
    listUser: Array<{
        list_user_user_id: number,
        list_user_role: string | null,
        fl: number | null,
        bl: number | null,
        User_username: string,
        User_avatarPath: string | null
    }>
}

type PropsUserInfo = {
    listUser: typeListUser["listUser"],
    jwt: string,
    id: string,
    setErrorCode: React.Dispatch<React.SetStateAction<number>>,
    setLstUser: React.Dispatch<React.SetStateAction<typeListUser["listUser"]>>
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
    setUserInfo: React.Dispatch<React.SetStateAction<typeUserInfo>>,
}

const listHandle = (event: MouseEvent<HTMLButtonElement>, jwt: string,
    userId: number,
    setErrorCode: React.Dispatch<React.SetStateAction<number>>,
    type: number,
    userInfo: typeUserInfo,
    setUserInfo: React.Dispatch<React.SetStateAction<typeUserInfo>>,
    lstUserGlobal: {
        id: number, fl: number | null,
        bl: number | null, User_username: string, User_avatarPath: string | null
    }[],
    setLstUserGlobal: React.Dispatch<React.SetStateAction<{
        id: number, fl: number | null,
        bl: number | null, User_username: string, User_avatarPath: string | null
    }[]>>): void => {
    event.preventDefault();

    function updateUserInfo(username: string, role: string | null, id: number,
        friend: number | null, block: number | null, avatarPath: string | null) {
        setUserInfo({
            username: username, role: role,
            id: id, friend: friend, block: block, avatarPath: avatarPath
        });
        updateBlackFriendList({
            id: id,
            fl: friend, bl: block, User_username: username, User_avatarPath: avatarPath
        }, lstUserGlobal, setLstUserGlobal);
    }

    fetch("https://" + location.host + "/api/users/fr-bl-list", {
        method: 'post',
        headers: headerPost(jwt),
        body: JSON.stringify({
            userId: userId, type: type
        })
    }).then(res => {
        if (res.ok)
            return (res.json());
        setErrorCode(res.status)
    }).then((res: { add: boolean, type: number }) => {
        if (res) {
            if (res.add) {
                if (res.type === 1) {
                    updateUserInfo(userInfo.username, userInfo.role, userInfo.id,
                        userInfo.friend, res.type, userInfo.avatarPath);
                } else if (res.type === 2) {
                    updateUserInfo(userInfo.username, userInfo.role, userInfo.id,
                        res.type, userInfo.block, userInfo.avatarPath);
                }
            } else {
                if (res.type === 1) {
                    updateUserInfo(userInfo.username, userInfo.role, userInfo.id,
                        userInfo.friend, null, userInfo.avatarPath);
                } else if (res.type === 2) {
                    updateUserInfo(userInfo.username, userInfo.role, userInfo.id,
                        null, userInfo.block, userInfo.avatarPath);
                }
            }
        }
    }).catch(e => console.log(e));
}

export const inviteGame = (event: MouseEvent<HTMLButtonElement>,
    userId: number, jwt: string, navigate, setErrorCode): void => {
    event.preventDefault();
    if (event.target)
        playPageInvite(jwt, setErrorCode,
            userId, navigate);
}

export const userProfile = (event: MouseEvent<HTMLButtonElement>,
    userId: number, navigate): void => {
    event.preventDefault();
    if (event.target)
        navigate({ pathname: "/profile/" + userId });
}

/*
    fetch to backend
    find both user id (user id is in the token)
    find PM from both user
    setId
    DirectMessage component will load messages itself
*/
type aswType = {
    asw: string | null | undefined
}
export const directMessage = (event: MouseEvent<HTMLButtonElement>,
    setDisplay: any, setId: React.Dispatch<React.SetStateAction<string>>,
    setErrorCode: React.Dispatch<React.SetStateAction<number>>,
    userId: number, jwt: string): void => {
    event.preventDefault();

    fetch('https://' + location.host + '/api/chat/private-messages?' + new URLSearchParams({
        id: String(userId),
    }), { headers: header(jwt) })
        .then(res => {
            if (res.ok)
                return (res.json());
            setErrorCode(res.status)
        }).then((res: aswType) => {
            if (res) {
                setDisplay(true);
                if (res.asw)
                    setId(res.asw);
            }
        }).catch(e => console.log(e));
}

const handleClick = (event: React.MouseEvent<HTMLDivElement>,
    userInfo: typeUserInfo,
    setUserInfo: React.Dispatch<React.SetStateAction<typeUserInfo>>,
    setUserId: any, setTop: any): void => {
    event.preventDefault();
    const e: HTMLElement = event.target as HTMLElement;
    const name: string = e.textContent as string;
    //get attributes node
    const attributes: NamedNodeMap = e.attributes as NamedNodeMap;
    const parentNode: HTMLElement = e.parentNode as HTMLElement;

    /* update userInfo state on click, from the html tree */
    if (e.nodeName === "SPAN"
        && (userInfo.username === "" || userInfo.username != name)) {
        setUserId(Number(attributes[1].value));
        if (attributes.length === 6)
            setUserInfo({
                username: name,
                role: attributes[2].value,
                id: Number(attributes[1].value),
                friend: Number(attributes[3].value),
                block: Number(attributes[4].value),
                avatarPath: attributes[5].value
            });
        else
            setUserInfo({ username: name, role: "", id: 0, block: null, friend: null, avatarPath: null });
    }
    else {
        setUserId(0);
        setUserInfo({ username: "", role: "", id: 0, block: null, friend: null, avatarPath: null })
    }
    setTop(parentNode.offsetTop);
}


/* 0 === offline
    1 === online
    2 === in game
*/
export const StatusUser = (props: { userId: number, jwt: string }) => {
    const { usrSocket } = useContext(SocketContext);
    const [status, setStatus] = useState<number>(0);
    useEffect(() => {
        //emit ask user conneced/ig on map, then return reponse
        //.on connections and deconnections
        usrSocket?.emit("status", { userId: props.userId }, (res: { code: number }) => {
            console.log(res)
            if (res)
                setStatus(res.code);
        });
        usrSocket?.on('currentStatus', (res: { code: number, userId: string }) => {
            console.log(res)
            if (res && props.userId === Number(res.userId))
                setStatus(res.code);
        })
        return (() => {
            usrSocket?.off("currentStatus");
            setStatus(0);
        })
    }, [props.userId, props.jwt]);
    return (<>
        {
            status === 0 && <div>
                <div style={{ width: "20px", backgroundColor: "grey" }}>
                </div><span style={{ flex: "1" }}>Offline</span>
            </div>
        }
        {
            status === 1 && <div>
                <div style={{ width: "20px", backgroundColor: "green" }}>
                </div><span style={{ flex: "1" }}>Online</span>
            </div>
        }
        {
            status === 2 && <div>
                <div style={{ width: "20px", backgroundColor: "orange" }}>
                </div><span style={{ flex: "1" }}>In game</span>
            </div>
        }
    </>);
}

const ButtonsInfos = (props: typeButtonsInfo) => {
    const { lstUserGlobal, setLstUserGlobal } = useContext(ContextDisplayChannel);
    const navigate = useNavigate();

    return (<>
        <StatusUser jwt={props.jwt} userId={props.userInfo.id} />
        <button onClick={(e) =>
            userProfile(e, props.userInfo.id, navigate)} className="userInfo">User Profile</button>
        <button onClick={(e) =>
            listHandle(e, props.jwt,
                props.userInfo.id, props.setErrorCode,
                1, props.userInfo, props.setUserInfo, lstUserGlobal, setLstUserGlobal)}
            className="userInfo">{(props.userInfo.block === 1 ? "Unblock" : "Block")}</button>
        <button onClick={(e) =>
            listHandle(e, props.jwt,
                props.userInfo.id, props.setErrorCode,
                2, props.userInfo, props.setUserInfo, lstUserGlobal, setLstUserGlobal)}
            className="userInfo">{(props.userInfo.friend === 2 ? "Remove" : "Add")} friend</button>
        <button onClick={(e) => inviteGame(e, props.userInfo.id, props.jwt,
            navigate, props.setErrorCode)}
            className="userInfo">Invite to a game</button>
        <button onClick={(e) =>
            directMessage(e, props.setDisplay,
                props.setId, props.setErrorCode,
                props.userId, props.jwt)
        } className="userInfo">Direct message</button>
        <AdminComponent
            id={props.id} userId={props.userId} jwt={props.jwt}
            chooseClassName={props.chooseClassName}
            setErrorCode={props.setErrorCode} userInfo={props.userInfo} />
    </>)
}

export const handleImgError = (e) => {
    const target: HTMLImageElement = e.target as HTMLImageElement;

    if (target) {
        target.src = "/upload_avatar/default.png";
    }
}

const UserInfo = (props: PropsUserInfo): JSX.Element => {
    const { renderDirectMessage, userId, setDisplay, setUserId, setId } = useContext(ContextDisplayChannel);
    const [userInfo, setUserInfo] = useState<typeUserInfo>({
        username: "", role: "", id: 0, friend: null, block: null, avatarPath: null
    });
    //need to search in listUser, to update userInfo 
    //  variable content (like this AdminComponent get updated properly)
    const object = props.listUser;
    let found: any = undefined;
    if (object)
        found = object.find(elem => Number(elem.list_user_user_id) === userInfo.id);
    useEffect(() => {
        if (found) {
            setUserInfo({
                username: userInfo.username,
                role: found.list_user_role,
                id: Number(found.list_user_user_id),
                friend: found.fl, block: found.bl,
                avatarPath: found.User_avatarPath
            });
        }
    }, [found, props.id]);

    /* need to iterate listUser state, when user that has been updated is found
        return new array from map
    */
    useEffect(() => {
        const newArr: PropsUserInfo["listUser"] = props.listUser.map((value) => {
            if (value && found
                && (value.list_user_user_id === found.list_user_user_id)) {
                value.User_username = userInfo.username;
                value.list_user_role = userInfo.role;
                value.bl = userInfo.block;
                value.fl = userInfo.friend;
                return (value);
            }
            return (value);
        })
        if (found)
            props.setLstUser(newArr);
    }, [userInfo]);

    const [offsetTop, setTop] = useState<number>(0);
    const chooseClassName: string
        = (userInfo.username != "" ? "userInfo userInfoClick" : "userInfo");
    let i: number = 0;
    const Element = scroll.Element;

    const handleListenerClick = () => {
        setUserInfo({ username: "", role: "", id: 0, friend: null, block: null, avatarPath: null });
    }
    //Read React's reference doc
    const ref: any = useEventListenerUserInfo(handleListenerClick);
    const callback = useCallback(
        debounce(function resizeFunction() {
            if (userInfo.username != "") {
                const top = ref.current?.childBindings?.domNode?.offsetTop;
                if (typeof top !== "undefined")
                    setTop(top);
            }
        }, 100), [userInfo.username]
    );
    //When resizing info user Box
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
                        <span className='user' data-user-id={usr.list_user_user_id}
                            data-role={(usr.list_user_role == null ? "" : usr.list_user_role)}
                            data-friend={(usr.fl == null ? "" : usr.fl)}
                            data-block={(usr.bl == null ? "" : usr.bl)}
                            data-img={(usr.User_avatarPath == null ? "" : usr.User_avatarPath)}
                            key={++i}>{usr.User_username}</span>
                    ))
                }
            </Element >
            <div className={chooseClassName} style={{ top: offsetTop }}>
                <label className="userInfo">{userInfo.username}</label>
                <img src={"/" + userInfo.avatarPath} className="avatarList"
                    alt={"avatar " + userInfo.username}
                    onError={handleImgError}
                />
                <ButtonsInfos id={props.id} chooseClassName={chooseClassName}
                    renderDirectMessage={renderDirectMessage} setDisplay={setDisplay}
                    setId={setId} setErrorCode={props.setErrorCode}
                    userId={userId} jwt={props.jwt} userInfo={userInfo}
                    setUserInfo={setUserInfo} />
            </div>
        </>
    );
}

/* socket.on pour ecouter les user qui rejoignent le chat et les afficher */
const ListUserChat = (props: {
    id: string, jwt: string
}) => {
    const { usrSocket } = useContext(SocketContext);
    const [errorCode, setErrorCode] = useState<number>(200);
    const { lstUserChat, setLstUserChat } = useContext(ContextDisplayChannel);

    useEffect(() => {
        const fetchListUser = async (id: string, jwt: string, setErrorCode: any) => {
            return (await fetch('https://' + location.host + '/api/chat/users?' + new URLSearchParams({
                id: id,
            }), { headers: header(jwt) }).then(res => {
                if (res.ok)
                    return (res.json());
                setErrorCode(res.status);
            }).catch(e => console.log(e)));
        }
        fetchListUser(props.id, props.jwt, setErrorCode).then(res => {
            setLstUserChat(res);
        }).catch(e => console.log(e));
        usrSocket?.on("updateListChat", () => {
            fetchListUser(props.id, props.jwt, setErrorCode).then(res => {
                setLstUserChat(res);
            });
        });
        return (() => {
            setLstUserChat([]);
            usrSocket?.off("updateListChat");
        });
    }, [props.id, usrSocket]);

    if (errorCode >= 400)
        return (<FetchError code={errorCode} />);
    return (
        <React.Fragment>
            <h2>List users</h2>
            <UserInfo id={props.id} listUser={lstUserChat} jwt={props.jwt}
                setErrorCode={setErrorCode} setLstUser={setLstUserChat} />
        </React.Fragment>
    );
}

export default ListUserChat;