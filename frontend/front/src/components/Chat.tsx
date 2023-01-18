import React, { useEffect, useRef, MutableRefObject, useState } from 'react';
import ListUser from './ListUser';
import "../css/chat.css";
import { useLocation } from 'react-router-dom';
import img from "../assets/react.svg";
import scroll from 'react-scroll';

type msg = {
    lstMsg: Array<{
        avatarUrl: string,
        id: number | string,
        username: string,
        content: string
    }>
}

const lstMsg = (idChat: number): JSX.Element => {
    const [msg, setMsg] = useState<null | msg>();
    //use effect getter
    return (<></>);
}

const Chat = () => {
    const Element = scroll.Element;
    const location = useLocation();
    const msgEnd = useRef<null | HTMLSpanElement>() as MutableRefObject<HTMLSpanElement>;

    useEffect(() => {
        msgEnd?.current?.scrollIntoView({ behavior: "smooth" })
    })
    return (
        <>
            <article className='containerChat'>
                <div className="chatName"><span style={{ flex: 1 }}>{location.state.name}</span><button className='chatLeave'>Leave</button></div>
                <Element name="container" className="element fullBox" id="containerElement" style={{
                    overflow: 'scroll'
                }}>
                    <div><img src={img} className="chatBox" /><label className="chatBox">userNameuuuuuuuuuuuuuuuuuuuuuuuu </label></div>
                    <span className="chatBox">Contentqsdqdqsqshjsqhkjhdd</span>
                    <div>
                        <img src={img} className="chatBox" /><label className="chatBox">userNameuuuuuuuuuuuuuuuuuuuuuuuu </label>
                    </div><span className="chatBox">Contentqsdqdqsqsfkljfklsjqflklklkdskjdfkqdsjkdsjdskjsjdsklfjsdlkfjqjsdqlkfjdslkfjsdlkfjsdlfkjsdflksjlkqfjslkdjfsmfjsdlkfjsdlfjsdfksjldjfjklqsdlkjqdlkqsdjlkdqsjqlkdjqskdjqkdjqklsdjjqsdhqsjdhqjkdshhqsjksjqsjdqsdhqshqsdhsdhqksdhqshjsqhkjhdd</span>
                    <div>
                        <img src={img} className="chatBox" /><label className="chatBox">userNameuuuuuuuuuuuuuuuuuuuuuuuu </label>
                    </div>
                    <span className="chatBox">Contentqsdqdqsqsfkljfklsjqflklklkdskjdfkqdsjkdsjdskjsjdsklfjsdlkfjqjsdqlkfjdslkfjsdlkfjsdlfkjsdflksjlkqfjslkdjfsmfjsdlkfjsdlfjsdfksjldjfjklqsdlkjqdlkqsdjlkdqsjqlkdjqskdjqkdjqklsdjjqsdhqsjdhqjkdshhqsjksjqsjdqsdhqshqsdhsdhqksdhqshjsqhkjhdd</span>
                    <div>
                        <img src={img} className="chatBox" /><label className="chatBox">userNameuuuuuuuuuuuuuuuuuuuuuuuu </label>
                    </div>
                    <span className="chatBox">Contentqsdqdqsqsfkljfklsjqflklklkdskjdfkqdsjkdsjdskjsjdsklfjsdlkfjqjsdqlkfjdslkfjsdlkfjsdlfkjsdflksjlkqfjslkdjfsmfjsdlkfjsdlfjsdfksjldjfjklqsdlkjqdlkqsdjlkdqsjqlkdjqskdjqkdjqklsdjjqsdhqsjdhqjkdshhqsjksjqsjdqsdhqshqsdhsdhqksdhqshjsqhkjhdd</span>
                    <div><img src={img} className="chatBox" /><label className="chatBox">userNameuuuuuuuuuuuuuuuuuuuuuuuu </label></div>
                    <span className="chatBox">Contentqsdqdqsqshjsqhkjhdd</span>
                    <div><img src={img} className="chatBox" /><label className="chatBox">userNameuuuuuuuuuuuuuuuuuuuuuuuu </label></div>
                    <span className="chatBox">Contentqsdqdqsqshjsqhkjhdd</span>
                    <div><img src={img} className="chatBox" /><label className="chatBox">userNameuuuuuuuuuuuuuuuuuuuuuuuu </label></div>
                    <span className="chatBox">Contentqsdqdqsqshjsqhkjhdd</span>
                    <div><img src={img} className="chatBox" /><label className="chatBox">userNameuuuuuuuuuuuuuuuuuuuuuuuu </label></div>
                    <span className="chatBox">Contentqsdqdqsqshjsqhkjhdd</span>
                    <div><img src={img} className="chatBox" /><label className="chatBox">userNameuuuuuuuuuuuuuuuuuuuuuuuu </label></div>
                    <span className="chatBox">Contentqsdqdqsqshjsqhkjhdd</span>
                    <div><img src={img} className="chatBox" /><label className="chatBox">userNameuuuuuuuuuuuuuuuuuuuuuuuu </label></div>
                    <span ref={msgEnd} className="chatBox">Contentqsdqdqsqshjsqhkjhdd</span>
                </Element>
                <div className="sendMsg"><textarea className="chatBox" name="msg"></textarea><button className="chatBox">Go</button></div>
            </article>
            <article className='right'>
                <ListUser />
            </article>
        </>
    )
}


export default Chat;
