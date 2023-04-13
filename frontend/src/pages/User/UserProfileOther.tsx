import React, { useEffect, useState, useContext, MouseEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FetchError, header, headerPost } from '../../components/FetchError';
import UserContext from '../../contexts/UserContext';
import ContextDisplayChannel, { updateBlackFriendList } from '../../contexts/DisplayChatContext';
import { inviteGame } from '../../components/Chat/ListUser';
import { Match_History_Raw } from './Setting';


/* useLocation recover values from url
	useParams will get parameters id from url
*/

type statInfo = {
	level: number,
	rank: number
}

type rawMH = {
	type_game: string,
	t1_username: string,
	t2_username: string,
	t3_username: string
}

type userInfo = {
	username: string,
	userID: number,
	avatarPath: string | null,
	sstat: statInfo,
	match_h: rawMH
}

/* display default img if not img loaded */
const handleImgError = (e) => {
	const target: HTMLImageElement = e.target as HTMLImageElement;

	if (target) {
		target.src = "/upload_avatar/default.png";
	}
}

type frBl = {
	friend: number | null,
	block: number | null
}

function updateList(res: { add: boolean, type: number },
	otherUser: userInfo, frBl: frBl, lstUserGlobal, setLstUserGlobal) {
	function updateUserInfo(username: string, id: number,
		friend: number | null, block: number | null, avatarPath: string | null) {
		updateBlackFriendList({
			id: id,
			fl: friend, bl: block,
			User_username: username, User_avatarPath: avatarPath
		}, lstUserGlobal, setLstUserGlobal);
	}
	if (res.type === 2) {
		if (res.add === true)
			updateUserInfo(otherUser.username, Number(otherUser.userID),
				res.type, frBl.block,
				otherUser.avatarPath);
		else
			updateUserInfo(otherUser.username, Number(otherUser.userID),
				null, frBl.block,
				otherUser.avatarPath);
	} else if (res.type === 1) {
		if (res.add === true)
			updateUserInfo(otherUser.username, Number(otherUser.userID),
				frBl.friend, res.type,
				otherUser.avatarPath);
		else
			updateUserInfo(otherUser.username, Number(otherUser.userID),
				frBl.friend, null,
				otherUser.avatarPath);
	}
}

const listHandle = (event: MouseEvent<HTMLButtonElement>, jwt: string,
	setErrorCode: React.Dispatch<React.SetStateAction<number>>,
	type: number, id: string, otherUser: userInfo | undefined, frBl: frBl,
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

	fetch("https://" + location.host + "/api/users/fr-bl-list", {
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
			updateList(res, otherUser, frBl, lstUserGlobal, setLstUserGlobal);
		}
	}).catch(err => console.log(err));
}



const FriendBlockUser = (props: { userCtx, id, otherUser: userInfo | undefined, jwt: string }) => {
	const [errorCode, setErrorCode] = useState<number>(200);
	const { lstUserGlobal, setLstUserGlobal } = useContext(ContextDisplayChannel);
	const [frBl, setFrBl] = useState<frBl>({ friend: null, block: null });
	const navigate = useNavigate();

	const Button = (props: { num: number, jwt: string, id, otherUser: userInfo | undefined }) => {
		return (
			<button onClick={(e) => {
				listHandle(e, props.jwt, setErrorCode,
					props.num, props.id, props.otherUser, frBl,
					lstUserGlobal, setLstUserGlobal)
			}}
			>
				{props.num === 1 && (frBl.block === 1 ? "Unblock user" : "Block user")}
				{props.num === 2 && (frBl.friend === 2 ? "Remove friend" : "Add friend")}
			</button>
		);
	}
	useEffect(() => {
		lstUserGlobal.forEach((value, key) => {
			if (String(value.id) === props.id) {
				setFrBl({ friend: value.fl, block: value.bl });
			}
		});
	}, [JSON.stringify(lstUserGlobal)]);
	if (errorCode >= 400)
		return (<FetchError code={errorCode} />);
	if (props.otherUser) {
		return (<>
			{
				props.userCtx.getUserId() != props.id &&
				<Button num={1} jwt={props.jwt}
					id={props.id} otherUser={props.otherUser} />
			}
			{
				props.userCtx.getUserId() != props.id &&
				<Button num={2} jwt={props.jwt}
					id={props.id} otherUser={props.otherUser} />
			}
			{
				props.userCtx.getUserId() != props.id &&
				<button onClick={(e) =>
					inviteGame(e, Number(props.otherUser?.userID), props.jwt,
						navigate, setErrorCode)}
				>
					Invite to a game
				</button>
			}

		</>);
	}
	return (<></>);
}

const Match_History_Table = (props: Readonly<{ jwt: string | null , id: number}>) => {
	const [raw_MH, setRaw] = useState<Array<rawMH>>();
	const [errorCode, setErrorCode] = useState<number>(200);
	if (props.jwt === null)
		return (<div>Must be logged</div>);
	useEffect(() => {
		fetch('https://' + location.host + `/api/users/get_raw_mh_user/${id}`, {headers: header(props.jwt)})
		.then(res => {
			if (res.ok)
				return(res.json());
			setErrorCode(res.status);
		}).then((res: Array<rawMH>) => {
			if (res) {
				setRaw(res);
			}
		})
	}, [])
	
	return(
		<table>
			<thead>
				<tr>
					<th>Type Game</th>
					<th>Player_One</th>
					<th>Player_Two</th>
					<th>Player_Victory</th>
				</tr>
			</thead>
			<tbody>
					< Match_History_Raw rawMH={raw_MH}/>
			</tbody>
		</table>
	);
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
		fetch(`https://` + location.host + `/api/users/${id}`, { headers: header(props.jwt) })
			.then(res => {
				if (res.ok)
					return (res.json());
				setErrorCode(res.status);
			}).then(res => {
				if (res) {
					if (!res.avatarPath)
						res.avatarPath = "";
					setOtherUser(res);
				}
			}).catch(err => console.log(err));
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
				<li>Victoire: {42}</li>
				<li>Défaite: {42}</li>
				<li>Rang: {otherUser?.sstat.rank}</li>
				<li>Niveau: {otherUser?.sstat.level}</li>
			</ul>
			< Match_History_Table jwt={props.jwt} id={id}/>
			<FriendBlockUser userCtx={userCtx} id={id} otherUser={otherUser}
				jwt={props.jwt} />

		</>
	);
}

export default UserProfileOther;