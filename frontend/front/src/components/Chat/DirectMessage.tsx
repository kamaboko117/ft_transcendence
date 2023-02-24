import React, { useState, MouseEvent, useContext } from 'react';
import { FetchError, header, headerPost } from '../FetchError';
import { lstMsg, ListMsg, handleSubmitButton, handleSubmitArea } from './Chat';
import "../../css/directMessage.css";
import ContextDisplayChannel from '../../contexts/displayChat';
// useDisplayChat from '../../useHook/useDisplayChat';

type settingChat = {
    render: boolean,
    id: number,
    width: number,
    height: number,
    opacity: number
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

const Box = (props: settingChat) => {
    //const [, , refTwo] = useDisplayChat();
    const { renderDirectMessage, setDisplay } = useContext(ContextDisplayChannel);
    const [lstMsg, setLstMsg] = useState<lstMsg[]>([] as lstMsg[]);

    return (
        <article className='containerDirectMessage' style={{
            width:props.width,
            height: props.height,
            opacity: props.opacity
        }}>
            <div className="chatName">
                <span style={{ flex: 1 }}>Messages</span>
                <button onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                directMessage(e,
                renderDirectMessage,
                setDisplay)
            }>X</button>
            </div>
            <ListMsg lstMsg={lstMsg} />
        </article>
    );   
}

/*
    Waiting for user displaying Direct Message part
*/
const FoldDirectMessage = (props:settingChat) => {
    return (<article className='containerDirectMessage' style={{
        width:props.width,
        height: props.height,
        opacity: props.opacity
    }}><span>Click to unfold Personal Chat</span></article>);
}

const DirectMessage = (props: settingChat) => {
    const [errorCode, setErrorCode] = useState<number>(200);
    //get channel id

    if (errorCode >= 400) // a placer devant fonctions asynchrones semblerait t'il, le composant react se recharge
        return (<FetchError code={errorCode} />); //lorsqu'il se met a jour, semblerait t'il
    console.log("render: " + props.render);
    if (props.render === false)
        return <FoldDirectMessage render={props.render} id={props.id}
        width={props.width} height={50}
        opacity={props.opacity}/>
    return <Box render={props.render} id={props.id}
        width={props.width} height={props.height}
        opacity={props.opacity}/>
}

export default DirectMessage;