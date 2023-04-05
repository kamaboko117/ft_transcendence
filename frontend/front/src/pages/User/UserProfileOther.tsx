import React, { useEffect, useState, useContext, MouseEvent } from 'react';
import { useParams } from 'react-router-dom';
import { FetchError, header, headerPost } from '../../components/FetchError';
import UserContext from '../../contexts/UserContext';
import ContextDisplayChannel, { updateBlackFriendList } from '../../contexts/DisplayChatContext';


/* useLocation recover values from url
	useParams will get parameters id from url
*/

type statInfo = {
	victory: number,
	defeat: number,
	nb_games: number,
	level: number,
	rank: number
}

type userInfo = {
	username: string,
	/*token: string,*/
	userID: number,
	avatarPath: string | null,
	sstat: statInfo
}

/* display default img if not img loaded */
const handleImgError = (e) => {
	const target: HTMLImageElement = e.target as HTMLImageElement;

	if (target) {
		target.src = "/upload_avatar/default.png";
	}
}

const listHandle = (event: MouseEvent<HTMLButtonElement>, jwt: string,
	setErrorCode: React.Dispatch<React.SetStateAction<number>>,
	type: number, id: string, otherUser: userInfo | undefined,
	lstUserGlobal: {
		id: number, fl: number | null,
		bl: number | null, User_username: string, User_avatarPath: string | null
	}[],
	setLstUserGlobal: React.Dispatch<React.SetStateAction<{
		id: number, fl: number | null,
		bl: number | null, User_username: string, User_avatarPath: string | null
	}[]>>) => {
	if (!otherUser || !event || !event.target) {
		return;
	}
	fetch("http://" + location.host + "/api/users/fr-bl-list", {
		method: 'post',
		headers: headerPost(jwt),
		body: JSON.stringify({
			userId: Number(id), type: type
		})
	}).then(res => {
		if (res.ok)
			return (res.json());
		setErrorCode(res.status);
	}).then((res: { add: boolean, type: number }) => {
		if (res) {
			console.log(res)
			/*updateBlackFriendList({
				id: Number(id),
				fl: friend, bl: block,
				User_username: otherUser.username,
				User_avatarPath: otherUser.username
			}, lstUserGlobal, setLstUserGlobal);*/
		}
	}).catch(err => console.log(err));
}

type frBl = {
	friend: number | null,
	block: number | null
}

const FriendBlockUser = (props: { userCtx, id, otherUser: userInfo | undefined, jwt: string }) => {
	const [errorCode, setErrorCode] = useState<number>(200);
	const { lstUserGlobal, setLstUserGlobal } = useContext(ContextDisplayChannel);
	const [frBl, setFrBl] = useState<frBl>({ friend: null, block: null });
	useEffect(() => {
		lstUserGlobal.forEach((value, key) => {
			console.log(typeof value.id)
			console.log(typeof props.id)
			if (value.id === props.id) {
				setFrBl({ friend: value.fl, block: value.bl });
			}
		})
	}, [JSON.stringify(lstUserGlobal)]);
	if (errorCode >= 400)
		return (<FetchError code={errorCode} />);
	if (props.otherUser) {
		return (<>
			{props.userCtx.getUserId() != props.id && <button onClick={(e) => {
				listHandle(e, props.jwt, setErrorCode, 1, props.id, props.otherUser, lstUserGlobal, setLstUserGlobal)
			}}
			>{(frBl.block === 1 ? "Unblock" : "Block")} User</button>}
			{props.userCtx.getUserId() != props.id && <button onClick={(e) => {
				listHandle(e, props.jwt, setErrorCode, 2, props.id, props.otherUser, lstUserGlobal, setLstUserGlobal)
			}}
			>{(frBl.friend === 2 ? "Remove" : "Add")} friend</button>}
		</>);
	}
	return (<></>);
}

/* Focus user profile */
const UserProfileOther = (props: { jwt: string }) => {
	const id = useParams().id as string;
	const [errorCode, setErrorCode] = useState<number>(200);
	const [otherUser, setOtherUser] = useState<userInfo>();
	const userCtx: any = useContext(UserContext);

	if (isNaN(Number(id)))
		return (<span>Wrong type id</span>)
	useEffect(() => {
		fetch(`http://` + location.host + `/api/users/${id}`, { headers: header(props.jwt) })
			.then(res => {
				if (res.ok)
					return (res.json());
				setErrorCode(res.status);
			}).then(res => {
				console.log(res)
				if (res) {
					if (!res.avatarPath)
						res.avatarPath = "";
					setOtherUser(res);
				}
			})
	}, []);

	if (errorCode >= 400)
		return (< FetchError code={errorCode} />);
	if (typeof otherUser != undefined && otherUser?.userID === 0)
		return (<span>No user found</span>);
	return (
		<>
			<h1>Username: {otherUser?.username}</h1>
			{otherUser?.avatarPath != null && <img
				className="avatar"
				src={'/' + otherUser.avatarPath}
				alt={"avatar " + otherUser?.username}
				onError={handleImgError}
			/>}
			<ul>
				<li>Victoire: {otherUser?.sstat.victory}</li>
				<li>Défaite: {otherUser?.sstat.defeat}</li>
				<li>Rang: {otherUser?.sstat.rank}</li>
				<li>Niveau: {otherUser?.sstat.level}</li>
			</ul>
			<FriendBlockUser userCtx={userCtx} id={id} otherUser={otherUser}
				jwt={props.jwt} />

		</>
	);
}

export default UserProfileOther;