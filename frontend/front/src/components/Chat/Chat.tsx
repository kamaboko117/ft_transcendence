import React, { useEffect, useRef, MutableRefObject, useState, useContext } from 'react';
import ListUser from './ListUser';
import { FetchError, header, headerPost } from '../FetchError';
import "../../css/chat.css";
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import img from "../../assets/react.svg";
import scroll from 'react-scroll';
//import { io, Socket } from 'socket.io-client';
import { SocketContext } from '../../contexts/Socket';
import { ContextUserLeave } from '../../contexts/LeaveChannel';

type lstMsg = {
    lstMsg: Array<{
        idUser: string,
        username: string, //à enlever pour un find dans repository
        content: string
    }>
}

/* return user state list */
const ListMsg = (props: any) => {
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
                        <div><img src={img} className="chatBox" />
                            <label className="chatBox">{msg.username}</label>
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
/* Post msg */
const handleSubmitButton = (e: React.MouseEvent<HTMLButtonElement>,
    usrSocket: any, obj: any, ref: any, setMsg: any) => {
    e.preventDefault();
    usrSocket.emit('sendMsg', obj);
    setMsg("");
    ref.current.value = "";
}

const handleSubmitArea = (e: React.KeyboardEvent<HTMLTextAreaElement>,
    usrSocket: any, obj: any, ref: any, setMsg: any) => {
    if (e.key === "Enter" && e.shiftKey === false) {
        e.preventDefault();
        usrSocket.emit('sendMsg', obj);
        setMsg("");
        ref.current.value = "";
    }
}

/* besoin context utilisateur */

const MainChat = (props: any) => {
    const refElem = useRef(null);
    //const Element = scroll.Element;
    const [online, setOnline] = useState<undefined | boolean>(undefined)
    const usrSocket = useContext(SocketContext);
    useEffect(() => {
        //subscribeChat
        usrSocket.emit("joinRoomChat", {
            id: props.id,
            //idUser: window.navigator.userAgent,
            //username: window.navigator.userAgent,
            //name: props.getLocation.state.name,
            psw: props.psw
        }, (res: boolean) => {
            console.log(res);
            if (res === true)
                setOnline(true);
            else
                setOnline(false);
        });
        console.log("mount");
        return (() => {
            //unsubscribeChat
            console.log("unmount");
            usrSocket.emit("stopEmit", { id: props.id /*, name: props.getLocation.state.name*/ }, () => {
                setOnline(false);
            });
        })
    }, [props.id]);
    const contextUserLeave = useContext(ContextUserLeave);
    const [lstMsg, setLstMsg] = useState<lstMsg[]>([] as lstMsg[]);
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
                });
            if (typeof res != "undefined" && typeof res.lstMsg != "undefined") {
                console.log("load msg");
                console.log(res);
                setLstMsg(res.lstMsg);
                setChatName(res.name);
                if (res.accesstype === "2" || res.accesstype === "3")
                    contextUserLeave();
            }
            console.log("load...");
        }
        if (online === true)
            ft_lst();
        console.log("liste mount");
        usrSocket.on("sendBackMsg", (res: any) => {
            console.log("msg");
            setLstMsg((lstMsg) => [...lstMsg, res]);
        });
        return (() => {
            console.log("liste unmount");
            usrSocket.off("sendBackMsg");
            setLstMsg([]);
            setChatName("");
        });
    }, [lstMsg.keys, props.id, online])

    const [msg, setMsg] = useState<null | string>(null);
    const navigate = useNavigate();
    if (online === false)
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
                    //idUser: window.navigator.userAgent,
                    // username: window.navigator.userAgent,
                    /*name: props.getLocation.state.name*/
                }, navigate)}
                    className='chatLeave'>Leave</button>
            </div>
            <ListMsg lstMsg={lstMsg} />
            <div className="sendMsg">
                <textarea ref={refElem} id="submitArea"
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMsg(e.currentTarget.value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) =>
                        handleSubmitArea(e,
                            usrSocket, {
                            id: props.id,
                            //idUser: window.navigator.userAgent,
                            content: msg
                        },
                            refElem,
                            setMsg)}
                    className="chatBox" name="msg"></textarea>
                <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleSubmitButton(e,
                    usrSocket, {
                    id: props.id,
                    //idUser: window.navigator.userAgent,
                    content: msg
                }, refElem, setMsg)}
                    className="chatBox">Go</button>
            </div>
        </article>
        <article className='right'>
            <ListUser />
        </article>
    </>);
}

const onSubmit = async (e: React.FormEvent<HTMLFormElement>
    , value: string | null, jwt: string | null, id: string, setErrorCode: any): Promise<boolean> => {
    e.preventDefault();
    console.log("psw: " + value);
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
    }));
}

/* Detect and return if a password for the channel is used
    return a promise 
*/
const hasPassword = async (id: Readonly<string>, jwt: Readonly<string | null>, setErrorCode: any): Promise<boolean> => {
    console.log("HAS PSWD");
    return (await fetch('http://' + location.host + '/api/chat/has-paswd?' + new URLSearchParams({
        id: id,
        //iduser: window.navigator.userAgent,
    }),
        { headers: header(jwt) })
        .then(res => {
            if (res.ok)
                return (res.json());
            setErrorCode(res.status);
        }));
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

const Chat = () => {
    const jwt: string | null = localStorage.getItem("ft_transcendence_gdda_jwt");
    const getLocation = useLocation();
    const id = useParams().id as string;
    const [errorCode, setErrorCode] = useState<number>(200);
    const hasPass: Promise<boolean> = hasPassword(id, jwt, setErrorCode);
    const [psw, setLoadPsw] = useState<boolean | undefined>(undefined);

    if (errorCode >= 400)
        return (<FetchError code={errorCode} />)
    hasPass.then(res => {
        setLoadPsw(res);
    })
    return (<BlockChat id={id} getLocation={getLocation}
        setErrorCode={setErrorCode} jwt={jwt}
        hasPsw={psw} />);
}

export default Chat;
