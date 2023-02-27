import React, { useState, MouseEvent, useContext, useEffect, useRef } from 'react';
import { FetchError, header, headerPost } from '../FetchError';
import { lstMsg, ListMsg, handleSubmitButton, handleSubmitArea } from './Chat';
import "../../css/directMessage.css";
import ContextDisplayChannel from '../../contexts/displayChat';
import scroll from 'react-scroll';
import SocketContext from '../../contexts/Socket';
import { createPath } from 'react-router-dom';

type settingChat = {
    render: boolean,
    id: string,
    width: number,
    height: number,
    opacity: number,
    jwt: string,
    setId: React.Dispatch<React.SetStateAction<string> >
}

type settingBox = {
    render: boolean,
    id: string,
    width: number,
    height: number,
    opacity: number,
    jwt: string,
    setErrorCode: React.Dispatch<React.SetStateAction<number> >,
    setId: React.Dispatch<React.SetStateAction<string> >
}

type listPm = {
    id: string,
    name: string,
}

type propsListChannel = {
    listPm: Array<{
        id: string,
        name: string,
    }>,
    listChannel: Array<{
        id: string,
        name: string,
    }>,
    setId: React.Dispatch<React.SetStateAction<string> >
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

const handleClick = (event: React.MouseEvent<HTMLUListElement>,
    setId: React.Dispatch<React.SetStateAction<string> >) => {
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
        {overflowY: 'scroll', overflowX: 'hidden', height: '90%'}
    }>
    <ul onClick={(e: React.MouseEvent<HTMLUListElement>) =>
            handleClick(e, props.setId)} className='listDiscussion'>
        {props.listPm && props.listPm.map((chan: {id: string, name: string}) => (
            <li key={++i} id={chan.id}>
                {chan.name}
            </li>
        )) }
    </ul>
    </Element>

    <span>List channel</span>
    <Element name="container" className="element" style={
        {overflowY: 'scroll', overflowX: 'hidden', height: '90%'}
    }>
    <ul onClick={(e: React.MouseEvent<HTMLUListElement>) =>
            handleClick(e, props.setId)} className='listDiscussion'>
        {props.listChannel && props.listChannel.map((chan: {id: string, name: string}) => (
            <li key={++i} id={chan.id}>
                {chan.name}
            </li>
        )) }
    </ul>
    </Element>

    <input type="text" /*onChange={}*/ placeholder='Direct message a user' name="user" />
    <button>Search</button>
    </div>
    );
}

const DiscussionBox = (props: {
    id: string,
    jwt: string,
    setErrorCode: React.Dispatch<React.SetStateAction<number> >,
}) => {
    const refElem = useRef(null);
    const { usrSocket } = useContext(SocketContext);
    const [online, setOnline] = useState<undefined | boolean>(undefined)
    useEffect(() => {
        //subscribeChat
        usrSocket.emit("joinRoomChat", {
            id: props.id,
        }, (res: boolean) => {
            console.log(res);
            if (res === true)
                setOnline(true);
            else
                setOnline(false);
        });
        //listen to excption sent by backend
        usrSocket.on('exception', (res) => {
            console.log("err");
            console.log(res);
            if (res.status === "error" && res.message === "Token not valid")
                props.setErrorCode(403);
            else
                props.setErrorCode(500);
        })
        console.log("mount");
        return (() => {
            //unsubscribeChat
            console.log("unmount");
            usrSocket.emit("stopEmit", { id: props.id }, () => {
                setOnline(false);
            });
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
                console.log("load msg");
                console.log(res);
                setLstMsg(res.lstMsg);
                //if (res.accesstype === "2" || res.accesstype === "3")
                //    contextUserLeave();
            }
            console.log("load...");
        }
        if (online === true)
            ft_lst();
        console.log("liste mount");
        usrSocket.on("sendBackMsg", (res: any) => {
            console.log("msg");
            console.log(res);
            setLstMsg((lstMsg) => [...lstMsg, res]);
        });
        return (() => {
            console.log("liste unmount");
            usrSocket.off("sendBackMsg");
            setLstMsg([]);
        });
    }, [lstMsg.keys, props.id, online]);
    const [msg, setMsg] = useState<null | string>(null);

    if (online === false)
        return (<article className='containerDiscussionBox'>Unauthorized connection</article>)
    else if (typeof online == "undefined")
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
                    content: msg
                },
                refElem,
                setMsg)}
        className="chatBox" name="msg"></textarea>
        <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleSubmitButton(e,
            usrSocket, {
            id: props.id,
            content: msg
        }, refElem, setMsg)}
        >Go</button>
        <Button />
    </div>
</div>);
}

const Box = (props: settingBox) => {
    const [lstPm, setPm] = useState<listPm[]>([] as listPm[]);
    const [lstChannel, setChannel] = useState<listPm[]>([] as listPm[]);

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
            .then (res => {
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
    return (
        <article className='containerDirectMessage unfold' style={{
            maxWidth: props.width,
            maxHeight: props.height,
            opacity: props.opacity,
        }}>
            <ListDiscussion listPm={ lstPm } listChannel={lstChannel} setId={ props.setId }/>
            <DiscussionBox id={props.id} jwt={props.jwt}
                setErrorCode={props.setErrorCode} />
        </article>
    );   
}

/*
    Waiting for user displaying Direct Message part
*/
const FoldDirectMessage = (props:settingChat) => {
    return (<article className='containerDirectMessage fold' style={{
        maxWidth:props.width,
        height: props.height,
        opacity: props.opacity,
        background: 'red'
    }}><Button/><span>Open chat box</span></article>);
}

const UnfoldDirectMessage = (props: settingChat) => {
    const [errorCode, setErrorCode] = useState<number>(200);

    if (errorCode >= 400) // a placer devant fonctions asynchrones semblerait t'il, le composant react se recharge
        return (<FetchError code={errorCode} />); //lorsqu'il se met a jour, semblerait t'il
    if (props.render === false)
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