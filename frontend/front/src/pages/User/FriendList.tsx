import React, { useState, useContext, MouseEvent } from "react";
import ContextDisplayChannel, { LoadUserGlobal, updateBlackFriendList } from "../../contexts/DisplayChatContext";
import scroll from 'react-scroll';
import { useEventListenerUserInfo } from "../../useHook/useEventListener";
import { FetchError, headerPost } from "../../components/FetchError";
import { directMessage, StatusUser } from "../../components/Chat/ListUser";

type typeUserInfo = {
	username: string,
	id: number,
	fl: number | null,
	bl: number | null,
}

type typeFlBl = {
    id: number,
    fl: number | null,
    bl: number | null,
    User_username: string,
}

export const listHandle = (event: MouseEvent<HTMLButtonElement>, jwt: string,
    setErrorCode: React.Dispatch<React.SetStateAction<number>>,
    type: number,
    userInfo: typeUserInfo,
    setUserInfo: React.Dispatch<React.SetStateAction<typeUserInfo>>,
    lstUserGlobal: { id: number, fl: number | null,
        bl: number | null, User_username: string }[],
    setLstUserGlobal: React.Dispatch<React.SetStateAction<{
        id: number, fl: number | null,
        bl: number | null, User_username: string
    }[]>>): void => {
    event.preventDefault();

    function updateUserInfo(username: string, id: number,
        friend: number | null, block: number | null) {
        setUserInfo({
            username: username,
            id: id, fl: friend, bl: block
        });
        updateBlackFriendList({
            id: id,
            fl: friend, bl: block, User_username: username
        }, lstUserGlobal, setLstUserGlobal);
    }

    fetch("http://" + location.host + "/api/users/fr-bl-list", {
        method: 'post',
        headers: headerPost(jwt),
        body: JSON.stringify({
            userId: Number(userInfo.id), type: type
        })
    }).then(res => {
        if (res.ok)
            return (res.json());
        setErrorCode(res.status);
    }).then((res: { add: boolean, type: number }) => {
        if (res) {
            if (res.add) {
                if (res.type === 1) {
                    updateUserInfo(userInfo.username, Number(userInfo.id),
                        userInfo.fl, res.type);
                } else if (res.type === 2) {
                    updateUserInfo(userInfo.username, Number(userInfo.id),
                        res.type, userInfo.bl);
                }
            } else {
                if (res.type === 1) {
                    updateUserInfo(userInfo.username, Number(userInfo.id),
                        userInfo.fl, null);
                } else if (res.type === 2) {
                    updateUserInfo(userInfo.username, Number(userInfo.id),
                        null, userInfo.bl);
                }
            }
        }
    }).catch(e => console.log(e));
}

const handleClick = (event: React.MouseEvent<HTMLDivElement>,
	userInfo: typeUserInfo,
	setUserInfo: React.Dispatch<React.SetStateAction<typeUserInfo>>): void => {
	event.preventDefault();
	const e: HTMLElement = event.target as HTMLElement;
	const name: string = e.textContent as string;
	//get attributes node
	const attributes: NamedNodeMap = e.attributes as NamedNodeMap;
	const parentNode: HTMLElement = e.parentNode as HTMLElement;
		console.log(e)
	/* update userInfo state on click, from the html tree */
	if (userInfo.username === "" || userInfo.username != name) {
		//setUserId(Number(attributes[0].value));
		if (attributes.length === 3) {
			setUserInfo({
				username: name,
				id: Number(attributes[0].value),
				fl: Number(attributes[1].value),
				bl: Number(attributes[2].value)
			});
		}
		else
			setUserInfo({ username: name, id: 0, bl: null, fl: null });
	}
	else {
		//setUserId(0);
		setUserInfo({ username: "", id: 0, bl: null, fl: null })
	}
	//setTop(parentNode.offsetTop);
}

type typeButtonsInfo = {
    jwt: string,
    userInfo: typeUserInfo
    setUserInfo: React.Dispatch<React.SetStateAction<typeUserInfo>>,
	setErrorCode: React.Dispatch<React.SetStateAction<number>>,
	type: string
}

const ButtonsInfos = (props: typeButtonsInfo) => {
	const { renderDirectMessage, userId, setDisplay, setUserId, setId } = useContext(ContextDisplayChannel);
    const { lstUserGlobal, setLstUserGlobal } = useContext(ContextDisplayChannel);
	let type = 0;
	if (props.type === "block")
		type = 1;
	else if (props.type === "friend")
		type = 2;

    return (<>
		<StatusUser jwt={props.jwt} userId={props.userInfo.id} />
        {type && type === 2 && <button onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
            listHandle(e, props.jwt, props.setErrorCode,
                type, props.userInfo, props.setUserInfo, lstUserGlobal, setLstUserGlobal)}
            className="userInfo">{(props.userInfo.fl === type ? "Remove " : "Add ") + props.type}
		</button>}
		{type && type === 1 && <button onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
            listHandle(e, props.jwt, props.setErrorCode,
                type, props.userInfo, props.setUserInfo, lstUserGlobal, setLstUserGlobal)}
            className="userInfo">{(props.userInfo.bl === type ? "Remove " : "Add ") + props.type}
		</button>}
		{type && type === 2 && <button className="userInfo">Invite to a game</button>}
		<button className="userInfo">User Profile</button>
		{
			type && type == 2 && <button onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
            	directMessage(e, setDisplay,
					setId, props.setErrorCode,
					props.userInfo.id, props.jwt)
        	} className="userInfo">Direct message</button>
		}
    </>)
}

const PrintArray = (props: {type: string,  lstUserGlobal: Array<typeFlBl>}) => {
	let i: number = 0;
	return (<>
		{props.lstUserGlobal && props.type === "friend" &&
			props.lstUserGlobal.map((usr) => {
				if (usr.fl != null) {
					return(
						<span data-user-id={usr.id}
							data-friend={(usr.fl == null ? "" : usr.fl)}
							data-block={(usr.bl == null ? "" : usr.bl)}
							key={++i}>{ usr.User_username }</span>
						)
					}
				}
			)
		}
		{props.lstUserGlobal && props.type === "block" &&
			props.lstUserGlobal.map((usr) => {
				if (usr.bl != null) {
					return(
						<span data-user-id={usr.id}
							data-friend={(usr.fl == null ? "" : usr.fl)}
							data-block={(usr.bl == null ? "" : usr.bl)}
							key={++i}>{ usr.User_username }</span>
						)
					}
				}
			)
		}
	</>);
}

function handleSubmit(e: React.FormEvent<HTMLFormElement>,
	setLstUserGlobal: React.Dispatch<React.SetStateAction<Array<typeFlBl>>>,
	jwt: string, value: string | null, errorCode: number,
	setErrorCode: React.Dispatch<React.SetStateAction<number>>,
	lstUserGlobal: Array<typeFlBl>) {
	e.preventDefault();
	fetch("http://" + location.host + "/api/users/add-friend", {
		method: 'post',
		headers: headerPost(jwt),
		body: JSON.stringify({
			username: value, type: 2
		})
	}).then(res => {
		if (res.ok)
			return (res.json());
		setErrorCode(res.status);
	}).then(res => {
		console.log(res);
		if (res && res.code === 3)
		{
			updateBlackFriendList({
				id: res.id,
				fl: res.fl, bl: res.bl, User_username: res.User_username
			}, lstUserGlobal, setLstUserGlobal);
		}
	})
}

export const Display = (props: {jwt: string, lstUserGlobal: Array<typeFlBl>,
	userInfo: typeUserInfo,
	setUserInfo: React.Dispatch<React.SetStateAction<typeUserInfo>>,
	setErrorCode: React.Dispatch<React.SetStateAction<number>>,
	type: string}) => {
	const handleListenerClick = () => {
		props.setUserInfo({ username: "", id: 0, fl: null, bl: null });
	}
	const ref: any = useEventListenerUserInfo(handleListenerClick);
	const Element = scroll.Element;
	let i: number = 0;
	const chooseClassName: string = (props.userInfo.username != "" ? "userInfo userInfoClick" : "userInfo");
	return (<>
		<Element name="container" className="element fullBoxListUser" ref={ref}
			onClick={(e: React.MouseEvent<HTMLDivElement>) =>
				handleClick(e, props.userInfo, props.setUserInfo)}>
			<PrintArray lstUserGlobal={props.lstUserGlobal} type={props.type} />
		</Element>
		<div className={chooseClassName} style={{position: "relative"}}>
			<label className="userInfo">{props.userInfo.username}</label>
			<ButtonsInfos jwt={props.jwt} userInfo={props.userInfo} type={props.type}
			setUserInfo={props.setUserInfo} setErrorCode={props.setErrorCode} />
		</div>
		</>
	)
}

export default function FriendList(props: { jwt: string }) {
	const { lstUserGlobal, setLstUserGlobal } = useContext(ContextDisplayChannel);
	const [userInfo, setUserInfo] = useState<typeUserInfo>({
		username: "", id: 0, fl: null, bl: null
	});
	const [value, setValue] = useState<null | string>(null);
	const [errorCode, setErrorCode] = useState<number>(200);
	return (<section>
		<h1>Friend List</h1>
		<form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSubmit(e, setLstUserGlobal
			, props.jwt, value, errorCode, setErrorCode, lstUserGlobal)}>
			<input type="text" placeholder="Enter username"
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
					setValue(e.currentTarget.value)}/>
			<input type="submit" value="Add new friend" />
		</form>
		{errorCode && errorCode === 1 && <span>User not found</span>}
		{errorCode && errorCode >= 400 && <FetchError code={errorCode} />}
		<LoadUserGlobal jwt={props.jwt} />
		<Display jwt={props.jwt} lstUserGlobal={lstUserGlobal}
			userInfo={userInfo} type="friend"
			setUserInfo={setUserInfo} setErrorCode={setErrorCode} />
	</section>)
}