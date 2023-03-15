import React, { useState, MouseEvent, useContext, useEffect, useRef } from 'react';
import { FetchError, header } from '../FetchError';
import { lstMsg, ListMsg } from './Chat';
import "../../css/directMessage.css";
import ContextDisplayChannel from '../../contexts/displayChat';
import scroll from 'react-scroll';
import SocketContext from '../../contexts/Socket';
import { useLocation } from 'react-router-dom';
import UserContext from '../../contexts/UserContext';
import { ListUserChatBox } from './ListUser';

type settingChat = {
    render: boolean,
    id: string,
    width: number,
    height: number,
    opacity: number,
    jwt: string,
    setId: React.Dispatch<React.SetStateAction<string>>
}

type settingBox = {
    render: boolean,
    id: string,
    width: number,
    height: number,
    opacity: number,
    jwt: string,
    setErrorCode: React.Dispatch<React.SetStateAction<number>>,
    setId: React.Dispatch<React.SetStateAction<string>>
}

type listPm = {
    chatid: string,
    user: {
        username: string,
    }
}

type listChan = {
    id: string,
    name: string,
}

type propsListChannel = {
    jwt: string
    listPm: Array<{
        chatid: string,
        user: {
            username: string
        },
    }>,
    listChannel: Array<{
        id: string,
        name: string,
    }>,
    setId: React.Dispatch<React.SetStateAction<string>>,
    setErrorCode: React.Dispatch<React.SetStateAction<number>>,
    setPm: React.Dispatch<React.SetStateAction<listPm[]>>
}

const directMessage = (event: MouseEvent<HTMLButtonElement>,
    renderDirectMessage: boolean, setDisplay: any): void => {
    event.preventDefault();
    console.log(renderDirectMessage);
    if (renderDirectMessage === true)
        setDisplay(false)
    else
        setDisplay(true);
}

/* Post msg */
const handleSubmitButton = (e: React.MouseEvent<HTMLButtonElement>,
    usrSocket: any, obj: any,
    ref: any, setMsg: any,
    setLstMsgChat: React.Dispatch<React.SetStateAction<lstMsg[]>>,
    setLstMsgPm: React.Dispatch<React.SetStateAction<lstMsg[]>>) => {
    e.preventDefault();
    usrSocket.emit('sendMsg', obj, (res) => {
        console.log("res: ");
        console.log(res);
        if (res.room === obj.id && obj.idBox === obj.id)
            setLstMsgChat((lstMsg) => [...lstMsg, res]);
        if (res.room === obj.id)
            setLstMsgPm((lstMsg) => [...lstMsg, res]);
    })
    setMsg("");
    ref.current.value = "";
}

const handleSubmitArea = (e: React.KeyboardEvent<HTMLTextAreaElement>,
    usrSocket: any, obj: any,
    ref: any, setMsg: any,
    setLstMsgChat: React.Dispatch<React.SetStateAction<lstMsg[]>>,
    setLstMsgPm: React.Dispatch<React.SetStateAction<lstMsg[]>>) => {
    if (e.key === "Enter" && e.shiftKey === false) {
        e.preventDefault();
        usrSocket.emit('sendMsg', obj, (res) => {
            console.log(res);
            /*if (res.ban === true)
                setLstMsgChat((lstMsg) => [...lstMsg, res]);
            else if (res.mute === true) { }
            else {*/
            if (res.room === obj.id && obj.idBox === obj.id)
                setLstMsgChat((lstMsg) => [...lstMsg, res]);
            if (res.room === obj.id)
                setLstMsgPm((lstMsg) => [...lstMsg, res]);
            //}
        })
        setMsg("");
        ref.current.value = "";
    }
}

const Button = () => {
    const { renderDirectMessage, setDisplay } = useContext(ContextDisplayChannel);

    return (
        <button onClick={
            (e: React.MouseEvent<HTMLButtonElement>) =>
                directMessage(e,
                    renderDirectMessage,
                    setDisplay)
        }>X</button>
    );
}

const handleSubmitPmUser = (e: React.FormEvent<HTMLFormElement>, user: string, jwt: string,
    setId: React.Dispatch<React.SetStateAction<string>>,
    setErrorCode: React.Dispatch<React.SetStateAction<number>>,
    setPm: React.Dispatch<React.SetStateAction<listPm[]>>,
    /*listPm: Array<{
        chatid: string,
        user: {
            username: string
        },
    }>,*/) => {
    e.preventDefault();
    fetch('http://' + location.host + '/api/chat/find-pm-username?' + new URLSearchParams({
        username: String(user)
    }), { headers: header(jwt) })
        .then(res => {
            console.log(res);
            if (res.ok)
                return (res.json());
            setErrorCode(res.status);
        }).then((res: {
            channel_id: string, listPm: {
                chatid: string,
                user: {
                    username: string
                },
            }
        }) => {
            if (res) {
                setId(res.channel_id);
                setPm((listPm) => [...listPm, res.listPm]);
            }

        }).catch(e => console.log(e));
}

const BoxPmUser = (props: {
    setId: React.Dispatch<React.SetStateAction<string>>,
    setErrorCode: React.Dispatch<React.SetStateAction<number>>,
    setPm: React.Dispatch<React.SetStateAction<listPm[]>>,
    listPm: Array<{
        chatid: string,
        user: {
            username: string
        },
    }>,
    jwt: string
}) => {
    const [user, setUser] = useState<string>("");

    return (
        <form className='formPm' onSubmit={(e: React.FormEvent<HTMLFormElement>) =>
            handleSubmitPmUser(e, user, props.jwt,
                props.setId, props.setErrorCode, props.setPm/*, props.listPm*/)}>
            <input type="text" placeholder='Direct message a user' name="user"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setUser(e?.target?.value)} />
            <input type="submit" value="Search User" />
        </form>
    );
}

const handleClick = (event: React.MouseEvent<HTMLUListElement>,
    setId: React.Dispatch<React.SetStateAction<string>>) => {
    event.preventDefault()
    const target: HTMLElement = event.target as HTMLElement;
    setId(target.id);
}
1
const ListDiscussion = (props: propsListChannel) => {
    const Element = scroll.Element;
    let i = 0;

    return (<div className='listDiscussion'>
        <span>Privates messages</span>
        <Element name="container" className="element" style={
            { overflowY: 'scroll', overflowX: 'hidden', height: '90%' }
        }>
            <ul onClick={(e: React.MouseEvent<HTMLUListElement>) =>
                handleClick(e, props.setId)} className='listDiscussion'>
                {props.listPm && props.listPm.map((chan: listPm) => (
                    <li key={++i} id={chan.chatid}>
                        {chan.user.username}
                    </li>
                ))}
            </ul>
        </Element>

        <span>List channel</span>
        <Element name="container" className="element" style={
            { overflowY: 'scroll', overflowX: 'hidden', height: '90%' }
        }>
            <ul onClick={(e: React.MouseEvent<HTMLUListElement>) =>
                handleClick(e, props.setId)} className='listDiscussion'>
                {props.listChannel && props.listChannel.map((chan: { id: string, name: string }) => (
                    <li key={++i} id={chan.id}>
                        {chan.name}
                    </li>
                ))}
            </ul>
        </Element>
        <BoxPmUser setId={props.setId} setErrorCode={props.setErrorCode} setPm={props.setPm} jwt={props.jwt} listPm={props.listPm} />
    </div>
    );
}
/* getSecondPartRegex is url id */
const DiscussionBox = (props: {
    id: string,
    jwt: string,
    setErrorCode: React.Dispatch<React.SetStateAction<number>>,
    setId: React.Dispatch<React.SetStateAction<string>>,
    isPrivate: boolean
}) => {
    const stringRegex = /(\/\w*\/)/;
    const regex = RegExp(stringRegex, 'g')
    const getLocation = useLocation()?.pathname;
    const getFirstPartRegex = regex.exec(getLocation);
    let getSecondPartRegex = '';

    if (typeof getLocation !== "undefined") {
        getSecondPartRegex = getLocation.replace(stringRegex, "");
    }
    const userCtx: any = useContext(UserContext);
    const refElem = useRef(null);
    const { usrSocket } = useContext(SocketContext);
    const [online, setOnline] = useState<undefined | boolean | string>(undefined)
    useEffect(() => {
        //subscribeChat
        console.log("JOIN ROOM ID: " + props.id);
        if (props.id != "") {
            usrSocket?.emit("joinRoomChat", {
                id: props.id,
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
        }
        //listen to exception sent by backend
        usrSocket?.on('exception', (res) => {
            if (res.status === "error" && res.message === "Token not valid")
                props.setErrorCode(403);
            else
                props.setErrorCode(500);
        })
        console.log("mount");
        return (() => {
            //unsubscribeChat
            console.log("unmount");
            console.log("replace: " + getSecondPartRegex);
            console.log("props.id:" + props.id);
            if (getSecondPartRegex != props.id
                && getFirstPartRegex && getFirstPartRegex[0] == "/channels/") {
                console.log("emit has stopped");
                usrSocket?.emit("stopEmit", { id: props.id }, () => {
                    setOnline(false);
                });
            } else {
                console.log("must not stop emit from chat");
            }
            usrSocket?.off("exception");
        })
    }, [props.id, usrSocket]);

    //const [lstMsg, setLstMsg] = useState<lstMsg[]>([] as lstMsg[]);
    const { setLstMsgChat, lstMsgChat, lstMsgPm, lstUserPm, lstUserChat, setLstMsgPm } = useContext(ContextDisplayChannel);
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
            console.log(res);
            if (typeof res != "undefined" && typeof res.lstMsg != "undefined") {
                setLstMsgPm(res.lstMsg);
            }
            console.log("load...");
        }
        if (online === true)
            ft_lst();
        console.log("liste mount");
        usrSocket?.on("actionOnUser2", (res: any) => {
            if ((res.type === "Ban" || res.type === "Kick")
                && userCtx.getUserId() === res.user_id
                && res.room === props.id) {
                props.setId("");
            }
            if (res.room === props.id && getSecondPartRegex == props.id)
                setLstMsgChat((lstMsg) => [...lstMsg, res]);
            if (res.room === props.id)
                setLstMsgPm((lstMsg) => [...lstMsg, res]);
        });

        return (() => {
            console.log("liste unmount");
            usrSocket?.off("actionOnUser2");
            setLstMsgPm([]);
        });
    }, [lstMsgPm.keys, props.id, JSON.stringify(lstUserPm),
        online, usrSocket]);
    useEffect(() => {
        usrSocket?.on("sendBackMsg2", (res: any) => {
            lstUserPm.forEach((value) => {
                if (Number(value.list_user_user_id) === res.user_id
                    && !value.bl) {
                    if (res.room === props.id && getSecondPartRegex == props.id)
                        setLstMsgChat((lstMsg) => [...lstMsg, res]);
                    if (res.room === props.id)
                        setLstMsgPm((lstMsg) => [...lstMsg, res]);
                }
            })
        });
        return (() => { usrSocket?.off("sendBackMsg2"); });
    }, [JSON.stringify(lstUserChat), JSON.stringify(lstUserPm)]);
    const [msg, setMsg] = useState<null | string>(null);

    if (online === "Ban" && props.id != "")
        return (<article className='containerDiscussionBox'><span className='fullBox'>You are banned from this chat</span><Button /></article>)
    else if (props.id != "" && online === false)
        return (<article className='containerDiscussionBox'><span className='fullBox'>Unauthorized connection</span><Button /></article>)
    else if (props.id != "" && typeof online == "undefined")
        return (<article className='containerDiscussionBox'><span className='fullBox'>Connecting to chat...</span><Button /></article>)
    return (<div className='containerDiscussionBox'>
        <ListMsg lstMsg={lstMsgPm} />
        <div className='containerPost'>
            <textarea ref={refElem} id="submitArea"
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMsg(e.currentTarget.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) =>
                    handleSubmitArea(e,
                        usrSocket, {
                        id: props.id,
                        idBox: getSecondPartRegex,
                        content: msg,
                        isPm: props.isPrivate,
                    },
                        refElem,
                        setMsg, setLstMsgChat, setLstMsgPm
                    )}
                className="chatBox" name="msg"></textarea>
            <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleSubmitButton(e,
                usrSocket, {
                id: props.id,
                idBox: getSecondPartRegex,
                content: msg,
                isPm: props.isPrivate,
            }, refElem, setMsg, setLstMsgChat, setLstMsgPm)}
            >Go</button>
            <Button />
        </div>
        <ListUserChatBox id={props.id} jwt={props.jwt} />
    </div>);
}

const Box = (props: settingBox) => {
    const [lstPm, setPm] = useState<listPm[]>([] as listPm[]);
    const [lstChannel, setChannel] = useState<listChan[]>([] as listChan[]);

    useEffect(() => {
        /* load privates messages */
        fetch('http://' + location.host + '/api/chat/list-pm',
            { headers: header(props.jwt) })
            .then(res => {
                if (res.ok)
                    return (res.json());
                props.setErrorCode(res.status);
            })
            .then(res => {
                setPm(res);
            }).catch(e => console.log(e));
        /* load all channels */
        fetch('http://' + location.host + '/api/chat/channel-registered',
            { headers: header(props.jwt) })
            .then(res => {
                if (res.ok)
                    return (res.json());
                props.setErrorCode(res.status);
            }).then(res => {
                setChannel(res);
            }).catch(e => console.log(e))
        return (() => {
            setPm([]);
            setChannel([]);
        })
    }, [lstPm.keys, lstChannel.keys]);
    const [isPrivate, setIsPrivate] = useState<boolean>(false);
    return (
        <article className='containerDirectMessage unfold' style={{
            maxWidth: props.width,
            maxHeight: props.height,
            opacity: props.opacity,
        }}>
            <ListDiscussion listPm={lstPm} listChannel={lstChannel}
                setId={props.setId} setErrorCode={props.setErrorCode} setPm={setPm}
                jwt={props.jwt} />
            <DiscussionBox id={props.id} jwt={props.jwt}
                setErrorCode={props.setErrorCode} setId={props.setId}
                isPrivate={isPrivate} />
        </article>
    );
}

/*
    Waiting for user displaying Direct Message part
*/
const FoldDirectMessage = (props: settingChat) => {
    return (<article className='containerDirectMessage fold' style={{
        maxWidth: props.width,
        height: props.height,
        opacity: props.opacity,
        background: 'red'
    }}><Button /><span>Open chat box</span></article>);
}

const UnfoldDirectMessage = (props: settingChat) => {
    const [errorCode, setErrorCode] = useState<number>(200);

    if (errorCode >= 400) // a placer devant fonctions asynchrones semblerait t'il, le composant react se recharge
        return (<FetchError code={errorCode} />);
    if (props.render === false || typeof props.id === "undefined")
        return <FoldDirectMessage render={props.render} id={props.id}
            width={props.width} height={50}
            opacity={0.6} jwt={props.jwt}
            setId={props.setId}
        />
    return <Box render={props.render} id={props.id}
        width={props.width} height={props.height}
        opacity={0.9} jwt={props.jwt}
        setErrorCode={setErrorCode} setId={props.setId}
    />
}

export default UnfoldDirectMessage;