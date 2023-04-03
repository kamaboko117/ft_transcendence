import React, { useEffect, useRef, useState, useContext } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { FetchError, header } from '../../components/FetchError';


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
	token: string,
	userID: number,
	avatarPath: string,
	sstat: statInfo
}

const handleImgError = (e) => {
    const target: HTMLImageElement = e.target as HTMLImageElement;

    if (target) {
        target.src =  "/upload_avatar/default.png"; 
    }
}

const UserProfileOther = (props: {jwt: string}) => {
	const getLocation = useLocation();
    const id = useParams().id as string;
	const [errorCode, setErrorCode] = useState<number>(200);
	const [otherUser, setOtheruser] = useState<userInfo>();
	const id_res = id;
	console.log(id_res)
	if (isNaN(Number(id)))
		return (<span>Wrong type id</span>)
	useEffect(() => {
		fetch('http://' + location.host + `/api/users/${id_res}`, {headers: header(props.jwt)})
			.then(res => {
				console.log(res)
				if (res.ok)
					return (res.json());
			}).then(res => {
				console.log(res);
				if (res) {
					setOtheruser(res);
				}
			})
	}, []);
	if (errorCode >= 400)
		return(< FetchError code={errorCode}/>);
	return (
		<>
			<h1>Username: {otherUser?.username}</h1>
			< img
				className="avatar"
				src={"../" + otherUser?.avatarPath}
				alt={"avatar " + otherUser?.username}
				onError={handleImgError} 
			/>
			<ul>
				<li>Victoire: {otherUser?.sstat.victory}</li>
				<li>Défaite: {otherUser?.sstat.defeat}</li>
				<li>Rang: {otherUser?.sstat.rank}</li>
				<li>Niveau: {otherUser?.sstat.level}</li>
			</ul>
		</>
	)
}

export default UserProfileOther;
