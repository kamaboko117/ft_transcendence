import React, { MouseEvent, SyntheticEvent, useCallback, useContext, useEffect, useState } from 'react';
import { FetchError, header } from '../FetchError';
import { useEventListener } from '../../useHook/useEventListener'
import "../../css/channel.css"
import "../../css/chat.css"
import scroll from 'react-scroll';
import { SocketContext } from '../../contexts/Socket';
import { debounce } from 'debounce';

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
    }>
}

/*
<table className='tableInfo'>
    <thead>
        <tr>
            <th>User(s) connected</th>
        </tr>
    </thead>
    <tbody onClick={this.handleClick}>
        {this.state.listUser &&
            this.state.listUser.map((usr) => (
                <tr key={++i}>
                    <td>{usr.content}</td>
                </tr>
            ))
        }
    </tbody>
</table>
*/

/*
<div className={chooseClassName}>
    <label className="userInfo">{this.state.userName}</label>
    <button onClick={this.BlockUnblock} className="userInfo">Block/Unblock</button>
    <button onClick={this.InviteGame} className="userInfo">Invite to a game</button>
    <button onClick={this.UserProfile} className="userInfo">User Profile</button>
    <button onClick={this.DirectMessage} className="userInfo">Direct message</button>
</div>
*/

const blockUnblock = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
}
const inviteGame = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
}
const userProfile = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
}
const directMessage = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
}

const handleClick = (event: React.MouseEvent<HTMLDivElement>,
    id: string, setId: any, setTop: any): void => {
    event.preventDefault();
    const e: HTMLElement = event.target as HTMLElement;
    const name: string = e.textContent as string;

    if (id === "")
        setId(name);
    else if (id != name)
        setId(name);
    else
        setId("");
    setTop(e.offsetTop + 27);
}

const UserInfo = (props: PropsUserInfo): JSX.Element => {
    const [id, setId] = useState<string>("");
    const [offsetTop, setTop] = useState<number>(0);
    const chooseClassName: string = (id != "" ? "userInfo userInfoClick" : "userInfo");
    let i: number = 0;
    const Element = scroll.Element;

    const handleListenerClick = () => {
            setId("");
    }
    //Read React's reference doc
    const ref: any = useEventListener(handleListenerClick);
    //need callback otherwise useEffect will add X time function and will bug
    const callback = useCallback(
        debounce(function resizeFunction(){
            if (id != "")
            {
                const length = ref.current?.childBindings?.domNode?.childNodes.length;
                const arr = ref.current?.childBindings?.domNode?.childNodes;
                let i = 0;
                console.log(arr);
                for (i = 0; i < length; i++)
                {
                    if (id === arr[i].textContent)
                    {
                        console.log(arr[i].textContent);
                        setTop(arr[i].offsetTop + 27);
                        break ;
                    }
                }
            }
        }, 100), [id]
    );
    //For resize the info user Box
    useEffect(() => {
        window.addEventListener("resize", callback);
        return () => {
            window.removeEventListener("resize", callback);
        }
    }, [id, window.innerWidth, window.innerHeight]);
    
    return (
        <>
        <Element name="container" className="element fullBoxListUser" ref={ref}
            onClick={(e: React.MouseEvent<HTMLDivElement>) => handleClick(e, id, setId, setTop)}>
            {props.listUser &&
                props.listUser.map((usr) => (
                    <span tabIndex={usr.user_id} key={++i}>{usr.user.username}</span>
                ))
            }
        </Element >
        <div className={chooseClassName} style={{top: offsetTop}}>
            <label className="userInfo">{id}</label>
            <button onClick={blockUnblock} className="userInfo">Block/Unblock</button>
            <button onClick={inviteGame} className="userInfo">Invite to a game</button>
            <button onClick={userProfile} className="userInfo">User Profile</button>
            <button onClick={directMessage} className="userInfo">Direct message</button>
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
    const usrSocket = useContext(SocketContext);
    const [errorCode, setErrorCode] = useState<number>(200);
    const [lstUser, setLstUser] = useState<PropsUserInfo["listUser"]>(Array);

    useEffect(() => {
        const fetchListUser = async (id: string, jwt: string, setErrorCode: any) => {
            return (await fetch('http://' + location.host + '/api/chat/users?' + new URLSearchParams({
                id: id,
            }), { headers: header(jwt) }).then(res => {
                console.log("res1: " + res);
                if (res.ok)
                    return (res.json());
                setErrorCode(res.status);
            }));
        }
        fetchListUser(props.id, props.jwt, setErrorCode).then(res => {
            console.log(res);
            setLstUser(res);
        });
        usrSocket.on("updateListChat", (res: boolean) => {
            console.log(res);
            fetchListUser(props.id, props.jwt, setErrorCode).then(res => {
                console.log(res);
                setLstUser(res);
            });
        });
        console.log("list user mount");
        return (() => {
            console.log("list user unmount");
            setLstUser([]);
            usrSocket.off("updateListChat");
        });
    }, [lstUser.keys]);
    if (errorCode >= 400) // a placer devant fonctions asynchrones semblerait t'il, le composant react se recharge
        return (<FetchError code={errorCode} />); //lorsqu'il se met a jour, semblerait t'il
    return (
        <React.Fragment>
            <h2>List users</h2>
            <UserInfo listUser={lstUser} />
        </React.Fragment>
    );
}

export default ListUser;