import React, { useContext, useState } from "react";
import { FetchError, headerPost } from "../../components/FetchError";
import ContextDisplayChannel, { LoadUserGlobal, updateBlackFriendList } from "../../contexts/DisplayChatContext";
import { Display } from "./FriendList";

type typeUserInfo = {
	username: string,
	id: number,
	fl: number | null,
	bl: number | null,
	avatarPath: string | null
}

type typeFlBl = {
	id: number,
	fl: number | null,
	bl: number | null,
	User_username: string,
	User_avatarPath: string | null
}

function handleSubmit(e: React.FormEvent<HTMLFormElement>,
	setLstUserGlobal: React.Dispatch<React.SetStateAction<Array<typeFlBl>>>,
	jwt: string, value: string | null,
	setErrorCode: React.Dispatch<React.SetStateAction<number>>,
	lstUserGlobal: Array<typeFlBl>) {
	e.preventDefault();
	if (!e)
		return;
	if (!value || value === "")
		return;
	fetch("http://" + location.host + "/api/users/add-blacklist", {
		method: 'post',
		headers: headerPost(jwt),
		body: JSON.stringify({
			username: value, type: 2
		})
	}).then(res => {
		if (res.ok)
			return (res.json());
		setErrorCode(res.status)
	}).then(res => {
		console.log(res);
		if (res && res.code === 3) {
			updateBlackFriendList({
				id: res.id,
				fl: res.fl, bl: res.bl, User_username: res.User_username, User_avatarPath: res.User_avatarPath
			}, lstUserGlobal, setLstUserGlobal);
		}
	})
}

export default function BlackList(props: { jwt: string }) {
	const { lstUserGlobal, setLstUserGlobal } = useContext(ContextDisplayChannel);
	const [userInfo, setUserInfo] = useState<typeUserInfo>({
		username: "", id: 0, fl: null, bl: null, avatarPath: null
	});
	const [value, setValue] = useState<null | string>(null);
	const [errorCode, setErrorCode] = useState<number>(200);
	return (<section>
		<h1>Black List</h1>
		<form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSubmit(e, setLstUserGlobal
			, props.jwt, value, setErrorCode, lstUserGlobal)}>
			<input type="text" placeholder="Enter username"
				onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
					setValue(e.currentTarget.value)} />
			<input type="submit" value="Add new block" />
		</form>
		{errorCode && errorCode === 1 && <span>User not found</span>}
		{errorCode && errorCode >= 400 && <FetchError code={errorCode} />}
		<LoadUserGlobal jwt={props.jwt} />
		<Display jwt={props.jwt} lstUserGlobal={lstUserGlobal}
			userInfo={userInfo} type="block"
			setUserInfo={setUserInfo} setErrorCode={setErrorCode} />
	</section>)
}