import React, { useState, MouseEvent, useContext } from 'react';
import { FetchError, header, headerPost } from '../FetchError';
import { lstMsg, ListMsg, handleSubmitButton, handleSubmitArea } from './Chat';
import "../../css/directMessage.css";
import ContextDisplayChannel from '../../contexts/displayChat';
import scroll from 'react-scroll';

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

const ListDiscussion = () => {
    const Element = scroll.Element;
    return (<>
    <Element name="container" className="element" style={{overflowY: 'scroll'}}>
    <ul className='listDiscussion'>
        <li>testqsdqsdsqjdiqsdhqshsjhqshkdhdhsjdhsj</li>
        <li>test</li>
        <li>test</li><li>test</li><li>test</li><li>test</li><li>test</li><li>test</li><li>test</li><li>test</li>
        <li>test</li><li>test</li><li>test</li><li>test</li><li>test</li><li>test</li><li>test</li><li>test</li>
    </ul>
    </Element>
    <input type="text" /*onChange={}*/ placeholder='Direct message a user' name="user" />
    </>
    );
}

const Box = (props: settingChat) => {
    const [lstMsg, setLstMsg] = useState<lstMsg[]>([] as lstMsg[]);

    return (
        <article className='containerDirectMessage' style={{
            maxWidth: props.width,
            height: props.height,
            opacity: props.opacity,
            background: 'red'
        }}>
            <ListDiscussion/>
            <div className="chatName">
                <Button/>
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
        opacity={0.6}/>
    return <Box render={props.render} id={props.id}
        width={props.width} height={props.height}
        opacity={0.9}/>
}

export default UnfoldDirectMessage;