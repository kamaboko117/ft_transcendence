import React, { useEffect, useRef, useState, useContext } from 'react';
import ListUserChat from './ListUser';
import { FetchError, header, headerPost } from '../FetchError';
import "../../css/chat.css";
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import scroll from 'react-scroll';
import SocketContext from '../../contexts/Socket';
import { ContextUserLeave } from '../../contexts/LeaveChannel';
import UserContext from "../../contexts/UserContext";
import ContextDisplayChannel, { LoadUserGlobal } from '../../contexts/DisplayChatContext';
import { commandChat } from './CommandChat';

export type lstMsg = {
    lstMsg: Array<{
        idUser: string,
        content: string,
        img: string
    }>
}

const handleImgError = (e) => {
    const target: HTMLImageElement = e.target as HTMLImageElement;

    if (target) {
        target.src =  "/upload_avatar/default.png"; 
    }
}

/* return user state list */
export const ListMsg = (props: any) => {
    const scrollBottom = useRef<any>();
    const Element = scroll.Element;
    let EScroll = scroll.animateScroll;
    let i: number = 0;
    let arrayLength: number = props.lstMsg.length - 5;
    if (arrayLength < 0)
        arrayLength = 0;
    useEffect(() => {
        if (scrollBottom && scrollBottom.current)
            EScroll.scrollToBottom({ containerId: "containerElement", duration: 0 });
    }, [props.lstMsg, props.id, scrollBottom.current])
    return (
        <Element name="container" className="element fullBox" id="containerElement" ref={scrollBottom}>
            {
                props.lstMsg &&
                props.lstMsg.slice(arrayLength, props.lstMsg.length).map((msg: any) => (
                    <React.Fragment key={++i}>
                        <div>
                            <img src={"/" + msg.user.avatarPath} className="chatBox"
                                alt={"avatar " + msg.user.username}
                                onError={handleImgError}
                                />
                            <label className="chatBox">{msg.user.username}</label>
                        </div>
                        <span className="chatBox">{msg.content}</span>
                    </React.Fragment>
                ))
            }
        </Element>
    )
}

/* Leave chat */
const handleLeave = async (e: React.MouseEvent<HTMLButtonElement>, contextUserLeave: any, usrSocket: any, obj: {
    id: string,
}, navigate: any) => {
    e.preventDefault();
    console.log(obj);
    usrSocket.emit('leaveRoomChat', obj, (res: any) => {
        console.log("leave chat : " + res);
        navigate("/channels");
        contextUserLeave();
    });
}


type typePostMsg = {
    id: string, msg: any,
    usrSocket: any, setMsg: any,
    setLstMsgChat: React.Dispatch<React.SetStateAction<lstMsg[]>>,
    setLstMsgPm: React.Dispatch<React.SetStateAction<lstMsg[]>>,
    setErrorCode: React.Dispatch<React.SetStateAction<number>>,
}

const PostMsg = (props: typePostMsg) => {
    const refElem = useRef(null);
    const { id, lstUserGlobal, lstUserChat, setLstMsgChat,
        setLstMsgPm, setLstUserGlobal,
        setLstUserChat } = useContext(ContextDisplayChannel);
    const userCtx: any = useContext(UserContext);
    let jwt = userCtx.getJwt();

    /* Post msg */
    const handleSubmitButton = (e: React.MouseEvent<HTMLButtonElement>,
        obj: any, ref: any) => {
        e.preventDefault();

        if (obj.content && obj.content[0] === '/')
            commandChat(jwt, obj.content, props.setErrorCode,
                lstUserGlobal, lstUserChat, setLstUserGlobal, setLstUserChat);
        else {
            props.usrSocket.emit('sendMsg', obj, (res) => {
                if (res.room === obj.id)
                    setLstMsgChat((lstMsg) => [...lstMsg, res]);
                if (res.room === obj.id && obj.id == obj.idBox)
                    setLstMsgPm((lstMsg) => [...lstMsg, res]);
            })
        }
        props.setMsg("");
        ref.current.value = "";
    }

    const handleSubmitArea = (e: React.KeyboardEvent<HTMLTextAreaElement>,
        obj: any, ref: any) => {
        if (e.key === "Enter" && e.shiftKey === false) {
            e.preventDefault();
            if (obj.content && obj.content[0] === '/') {
                commandChat(jwt, obj.content, props.setErrorCode,
                    lstUserGlobal, lstUserChat, setLstUserGlobal, setLstUserChat);
            } else {
                props.usrSocket.emit('sendMsg', obj, (res) => {
                    if (res.room === obj.id)
                        setLstMsgChat((lstMsg) => [...lstMsg, res]);
                    if (res.room === obj.id && obj.id == obj.idBox)
                        setLstMsgPm((lstMsg) => [...lstMsg, res]);
                })
            }
            props.setMsg("");
            ref.current.value = "";
        }
    }

    return (
        <div className="sendMsg">
                <textarea ref={refElem} id="submitArea" placeholder='Inclure commande deban dans chat'
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => props.setMsg(e.currentTarget.value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) =>
                        handleSubmitArea(e,
                        {
                            id: props.id,
                            idBox: id,
                            content: props.msg
                        }, refElem)}
                    className="chatBox" name="msg"></textarea>
                <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleSubmitButton(e,
                {
                    id: props.id,
                    idBox: id,
                    content: props.msg
                }, refElem)}
                    className="chatBox">Go</button>
            </div>
    );
}

const MainChat = (props: any) => {
    const refElem = useRef(null);
    const [online, setOnline] = useState<undefined | boolean | string>(undefined)
    const userCtx: any = useContext(UserContext);
    const { usrSocket } = useContext(SocketContext);
    useEffect(() => {
        //subscribeChat
        usrSocket?.emit("joinRoomChat", {
            id: props.id,
            psw: props.psw
        }, (res: any) => {
            if (res.ban === true)
                setOnline("Ban");
            else {
                if (res === true)
                    setOnline(true);
                else
                    setOnline(false);
            }
        });
        //listen to excption sent by backend
        usrSocket?.on('exception', (res) => {
            console.log("err");
            if (res.status === "error" && res.message === "Token not valid")
                props.setErrorCode(403);
            else
                props.setErrorCode(500);
        });
        console.log("mount");
        console.log("START EMIT");
        return (() => {
            //unsubscribeChat
            console.log("STOP EMIT");
            console.log("unmount");
            usrSocket?.emit("stopEmit", { id: props.id }, () => {
                setOnline(false);
            });
            usrSocket?.off("exception");
        })
    }, [props.id, usrSocket]);
    const navigate = useNavigate();
    const contextUserLeave = useContext(ContextUserLeave);
    const { id, lstMsgChat, lstUserChat, lstUserGlobal, setLstMsgChat, setLstMsgPm } = useContext(ContextDisplayChannel);
    const [chatName, setChatName] = useState<string>("");

    useEffect(() => {
        const ft_lst = async () => {
            const res = await fetch('http://' + location.host + '/api/chat?' + new URLSearchParams({
                id: props.id,
            }),
                { headers: header(props.jwt) })
                .then(res => {
                    if (res.ok)
                        return (res.json());
                    props.setErrorCode(res.status);
                }).catch(e => console.log(e));
            if (typeof res != "undefined" && typeof res.lstMsg != "undefined") {
                setLstMsgChat(res.lstMsg);
                setChatName(res.name);
                if (res.accesstype === "2" || res.accesstype === "3")
                    contextUserLeave();
            }
            console.log("load...");
        }
        if (online === true)
            ft_lst();
        console.log("liste mount");
        usrSocket?.on("actionOnUser", (res: any) => {
            if ((res.type === "Ban" || res.type === "Kick")
                && userCtx.getUserId() === res.user_id
                && res.room === props.id) {
                navigate("/channels");
                contextUserLeave();
            }
            if (res.room === props.id)
                setLstMsgChat((lstMsg) => [...lstMsg, res]);
            //if (res.room === props.id && props.id == id)
            //    setLstMsgPm((lstMsg) => [...lstMsg, res]);
        });
        return (() => {
            console.log("liste unmount");
            usrSocket?.off("actionOnUser");
            setLstMsgChat([]);
            setChatName("");
        });
    }, [lstMsgChat.keys, props.id, /*JSON.stringify(lstUserChat),*/ JSON.stringify(lstUserGlobal),
        online, usrSocket]);
    /* Get message from backend, must reload properly when lstUser is updated */
    useEffect(() => {
        usrSocket?.on("sendBackMsg", (res: any) => {
            //need to check if user is blocked
            let found = lstUserGlobal.find(elem => Number(elem.id) === res.user_id);
            if (!found) {
                if (res.room === props.id)
                    setLstMsgChat((lstMsg) => [...lstMsg, res]);
                //if (res.room === props.id && props.id == id)
                //    setLstMsgPm((lstMsg) => [...lstMsg, res]);
            }
        });
        return (() => { usrSocket?.off("sendBackMsg"); });
    }, [JSON.stringify(lstUserGlobal)])
    const [msg, setMsg] = useState<null | string>(null);
    //const [lstUser, setLstUser] = useState<typeListUser["listUser"]>(Array);
    if (online === "Ban")
        return (<article className='containerChat'>You are banned from this chat</article>)
    else if (online === false)
        return (<article className='containerChat'>Unauthorized connection</article>)
    else if (typeof online == "undefined")
        return (<article className='containerChat'>Connecting to chat...</article>)
    return (<>
        <article className='containerChat'>
            <div className="chatName">
                <span style={{ flex: 1 }}>{chatName}</span>
                <span style={{ flex: 0 }}>CHANNEL ID: {props.id}</span>
                <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleLeave(e,
                    contextUserLeave, usrSocket, {
                    id: props.id,
                }, navigate)}
                    className='chatLeave'>Leave</button>
            </div>
            <ListMsg lstMsg={lstMsgChat} />
            <PostMsg id={props.id} msg={msg} usrSocket={usrSocket} setErrorCode={props.setErrorCode}
                setMsg={setMsg} setLstMsgChat={setLstMsgChat} setLstMsgPm={setLstMsgPm} />
            {/*<div className="sendMsg">
                <textarea ref={refElem} id="submitArea" placeholder='Inclure commande deban dans chat'
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMsg(e.currentTarget.value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) =>
                        handleSubmitArea(e,
                            usrSocket, {
                            id: props.id,
                            idBox: id,
                            content: msg
                        },
                            refElem,
                            setMsg, setLstMsgChat, setLstMsgPm)}
                    className="chatBox" name="msg"></textarea>
                <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleSubmitButton(e,
                    usrSocket, {
                    id: props.id,
                    idBox: id,
                    content: msg
                }, refElem, setMsg, setLstMsgChat, setLstMsgPm)}
                    className="chatBox">Go</button>
            </div>*/}
        </article>
        <article className='right'>
            <LoadUserGlobal jwt={props.jwt} />
            <ListUserChat id={props.id} jwt={props.jwt} />
        </article>
    </>);
}

const onSubmit = async (e: React.FormEvent<HTMLFormElement>
    , value: string | null, jwt: string | null, id: string,
    setErrorCode: React.Dispatch<React.SetStateAction<number>>): Promise<boolean> => {
    e.preventDefault();

    if (value === "" || value === null)
        return (false);
    return (await fetch("http://" + location.host + "/api/chat/valid-paswd/", {
        method: 'post',
        headers: headerPost(jwt),
        body: JSON.stringify({
            id: id,
            psw: value
        })
    }).then(res => {
        if (res.ok)
            return (res.json())
        setErrorCode(res.status);
        return (false);
    }).catch(e => console.log(e)));
}

/* Detect and return if a password for the channel is used
    return a promise 
*/
const hasPassword = async (id: Readonly<string>, jwt: Readonly<string | null>,
    setErrorCode: React.Dispatch<React.SetStateAction<number>>): Promise<boolean> => {
    return (await fetch('http://' + location.host + '/api/chat/has-paswd?' + new URLSearchParams({
        id: id,
    }),
        { headers: header(jwt) })
        .then(res => {
            if (res.ok)
                return (res.json());
            setErrorCode(res.status);
        }).catch(e => console.log(e)));
}

const DisplayErrorPasswordBox = (props: { error: boolean }) => {
    if (props.error === true)
        return (<p>Wrong password</p>);
    return (<></>);
}

/* Ne doit pas pouvoir discuter sur le chat même en modifiant pass is valid à true
    besoin backend */
const PasswordBox = (props: Readonly<any>): JSX.Element => {
    const [valid, setValid] = useState(false);
    const [value, setValue] = useState<string | null>(null);
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        setValid(false);
        setValue(null);
        setError(false);
    }, [props.id]);
    if (props.hasPsw === true && valid == false) {
        return (<article className='containerChat'>
            <p>This channel require a password</p>
            <form onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
                const result = await onSubmit(e, value, props.jwt, props.id, props.setErrorCode);
                setValid(result);
                console.log(result);
                (valid === false) ? setError(true) : setError(false);
            }}>
                <label>Password * :</label>
                <input type="password" name="psw"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setValue(e.currentTarget.value)} />
                <input type="submit" />
            </form>
            <DisplayErrorPasswordBox error={error} />
        </article>);
    }
    return (<MainChat id={props.id} getLocation={props.getLocation}
        setErrorCode={props.setErrorCode} jwt={props.jwt}
        psw={value} />);
}

const BlockChat = (props: any) => {
    if (props.hasPsw !== undefined) {
        if (props.hasPsw == false)
            return (<MainChat id={props.id}
                getLocation={props.getLocation}
                setErrorCode={props.setErrorCode} jwt={props.jwt}
                psw="" />);
        else
            return (<PasswordBox id={props.id} hasPsw={props.hasPsw}
                getLocation={props.getLocation}
                setErrorCode={props.setErrorCode} jwt={props.jwt} />);
    }
    return (<></>);
}

const Chat = (props: { jwt: string }) => {
    const getLocation = useLocation();
    const id = useParams().id as string;
    const [errorCode, setErrorCode] = useState<number>(200);
    const [psw, setLoadPsw] = useState<boolean | undefined>(undefined);

    if (errorCode >= 400)
        return (<FetchError code={errorCode} />);
    const hasPass: Promise<boolean> = hasPassword(id, props.jwt, setErrorCode);
    hasPass.then(res => {
        setLoadPsw(res);
    }).catch(e => console.log(e));
    return (<BlockChat id={id} getLocation={getLocation}
        setErrorCode={setErrorCode} jwt={props.jwt}
        hasPsw={psw} />);
}

export default Chat;
