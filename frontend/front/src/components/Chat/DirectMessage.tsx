import React, { useState, MouseEvent, useContext, useEffect, useRef } from 'react';
import { FetchError, header, headerPost } from '../FetchError';
import { lstMsg, ListMsg } from './Chat';
import "../../css/directMessage.css";
import ContextDisplayChannel from '../../contexts/displayChat';
import scroll from 'react-scroll';
import SocketContext from '../../contexts/Socket';
import { createPath, FormEncType, useLocation, useParams } from 'react-router-dom';

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
    usrSocket: any, obj: any, ref: any, setMsg: any) => {
    e.preventDefault();
    usrSocket.emit('sendMsg', obj, (res) => {
        console.log("res: ");
        console.log(res);
    })
    setMsg("");
    ref.current.value = "";
}

const handleSubmitArea = (e: React.KeyboardEvent<HTMLTextAreaElement>,
    usrSocket: any, obj: any, ref: any, setMsg: any) => {
    if (e.key === "Enter" && e.shiftKey === false) {
        e.preventDefault();
        usrSocket.emit('sendMsg', obj, (res) => {
            console.log(res);
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
    setErrorCode: React.Dispatch<React.SetStateAction<number>>) => {
        e.preventDefault();
        fetch('http://' + location.host + '/api/chat/find-pm-username?' + new URLSearchParams({
                username: String(user)
        }), { headers: header(jwt) })
        .then(res => {
            console.log(res);
            if (res.ok)
                return (res.text());
            setErrorCode(res.status);
        }).then(res => {
            if (res)
                setId(res);
        });
}

const BoxPmUser = (props: {setId: React.Dispatch<React.SetStateAction<string>>,
        setErrorCode: React.Dispatch<React.SetStateAction<number>>,
    jwt: string}) => {
    const [user, setUser] = useState<string>("");

    return (
    <form className='formPm' onSubmit={(e: React.FormEvent<HTMLFormElement>) =>
        handleSubmitPmUser(e, user, props.jwt, props.setId, props.setErrorCode)}>
        <input type="text" placeholder='Direct message a user' name="user"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setUser(e?.target?.value)} />
        <input type="submit" value ="Search User" />
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
        <BoxPmUser setId={props.setId} setErrorCode={props.setErrorCode} jwt={props.jwt} />
    </div>
    );
}

const DiscussionBox = (props: {
    id: string,
    jwt: string,
    setErrorCode: React.Dispatch<React.SetStateAction<number>>,
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
    const refElem = useRef(null);
    const { usrSocket } = useContext(SocketContext);
    const [online, setOnline] = useState<undefined | boolean>(undefined)
    useEffect(() => {
        //subscribeChat
        console.log("JOIN ROOM ID: " + props.id);
        if (props.id != "") {
            usrSocket.emit("joinRoomChat", {
                id: props.id,
            }, (res: boolean) => {
                console.log(res);
                if (res === true)
                    setOnline(true);
                else
                    setOnline(false);
            });
        }
        //listen to exception sent by backend
        usrSocket.on('exception', (res) => {
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
                usrSocket.emit("stopEmit", { id: props.id }, () => {
                    setOnline(false);
                });
            } else {
                console.log("must not stop emit from chat");
            }
            usrSocket.off("exception");
        })
    }, [props.id]);

    const [lstMsg, setLstMsg] = useState<lstMsg[]>([] as lstMsg[]);
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
                });
            if (typeof res != "undefined" && typeof res.lstMsg != "undefined") {
                setLstMsg(res.lstMsg);
            }
            console.log("load...");
        }
        if (online === true)
            ft_lst();
        console.log("liste mount");
        usrSocket.on("sendBackMsg2", (res: any) => {
            if (res.room === props.id)
                setLstMsg((lstMsg) => [...lstMsg, res]);
        });
        return (() => {
            console.log("liste unmount");
            usrSocket.off("sendBackMsg2");
            setLstMsg([]);
        });
    }, [lstMsg.keys, props.id, online]);
    const [msg, setMsg] = useState<null | string>(null);

    if (props.id != "" && online === false)
        return (<article className='containerDiscussionBox'>Unauthorized connection</article>)
    else if (props.id != "" && typeof online == "undefined")
        return (<article className='containerDiscussionBox'>Connecting to chat...</article>)
    return (<div className='containerDiscussionBox'>
        <ListMsg lstMsg={lstMsg} />
        <div className='containerPost'>
            <textarea ref={refElem} id="submitArea"
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMsg(e.currentTarget.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) =>
                    handleSubmitArea(e,
                        usrSocket, {
                        id: props.id,
                        content: msg,
                        isPm: props.isPrivate,
                    },
                        refElem,
                        setMsg
                    )}
                className="chatBox" name="msg"></textarea>
            <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleSubmitButton(e,
                usrSocket, {
                id: props.id,
                content: msg,
                isPm: props.isPrivate,
            }, refElem, setMsg)}
            >Go</button>
            <Button />
        </div>
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
            });
        /* load all channels */
        fetch('http://' + location.host + '/api/chat/channel-registered',
            { headers: header(props.jwt) })
            .then(res => {
                if (res.ok)
                    return (res.json());
                props.setErrorCode(res.status);
            }).then(res => {
                setChannel(res);
            })
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
                setId={props.setId} setErrorCode={props.setErrorCode}
                jwt={props.jwt} />
            <DiscussionBox id={props.id} jwt={props.jwt}
                setErrorCode={props.setErrorCode} isPrivate={isPrivate} />
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