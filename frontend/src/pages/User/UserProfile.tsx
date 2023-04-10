import React, { useEffect, useState } from "react";
import { FetchError, header } from "../../components/FetchError";
import '../../css/user.css';
import Setting from "./Setting";

type statInfo = {
	victory: number,
	defeat: number,
	nb_games: number,
	level: number,
	rank: number
}

type userInfo = {
	username: string,
	token: string,
	userID: number,
	avatarPath: string,
	sstat: statInfo
}

/* display default img if not img loaded */
const handleImgError = (e) => {
	const target: HTMLImageElement = e.target as HTMLImageElement;

	if (target) {
		target.src = "/upload_avatar/default.png";
	}
}

export const headerPost = (jwt: Readonly<string | null>) => {
	const header = new Headers({
		Authorization: 'Bearer ' + jwt,
	})
	return (header);
};

/*
	Owner profile
*/
const UserProfile = (props: Readonly<{ jwt: string | null }>) => {
	if (props.jwt === null)
		return (<div>Must be logged</div>);
	const [avatar_path, setavatar_path] = useState<string | null>(null);
	const [errorCode, setErrorCode] = useState<number>(200);
	const [user, setSstat] = useState<userInfo>();
	useEffect(() => {
		fetch('https://' + location.host + '/api/users/profile/', { headers: header(props.jwt) })
			.then(res => {
				if (res.ok)
					return (res.json());
				setErrorCode(res.status);
			}).then((res: userInfo) => {
				if (res) {
					if (res.avatarPath)
						setavatar_path(res.avatarPath);
					else
						setavatar_path("");
					setSstat(res);
				}
			}).catch(e => console.log(e));
	}, [props.jwt]);
	if (errorCode >= 400)
		return (<FetchError code={errorCode} />);
	return (
		<>
			<h1>Username: [{user?.username}]</h1>
			{/*avatar_path != null && <img
				className="avatar"
				src={avatar_path}
				alt={"avatar " + user?.username}
				onError={handleImgError}
	/>*/}
			<ul>
				<li>Victoire: {user?.sstat.victory}</li>
				<li>Défaite: {user?.sstat.defeat}</li>
				<li>Rang: {user?.sstat.rank}</li>
				<li>Niveau: {user?.sstat.level}</li>
			</ul>
			<Setting jwt={props.jwt} />
		</>
	);
}

export default UserProfile;