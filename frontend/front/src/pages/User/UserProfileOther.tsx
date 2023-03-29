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

const UserProfileOther = (props: {jwt: string}) => {
	const getLocation = useLocation();
    const id = useParams().id as string;
	const [errorCode, setErrorCode] = useState<number>(200);
	const [avatar_path, setavatar_path] = useState<string>("");
	const [otherUser, setOtheruser] = useState<userInfo>();
	const id_res = Number(id);
	console.log(id_res);
	if (isNaN(Number(id)))
		return (<span>Wrong type id</span>)
	useEffect(() => {
		fetch('http://' + location.host + `/api/users/id/${id_res}/`)
			.then(res => {
				if (res.ok)
					return(res.json());
			})
	}, []);
	/*
	useEffect( () => {
		fetch('http://' + location.host + '/api/users/profile/', {headers: header(props.jwt)})
			.then(res => {
				if (res.ok)
					return (res.json());
				setErrorCode(res.status);
			}).then((res: userInfo) => {
				console.log(res);
				if (res && res.avatarPath)
					setavatar_path(res.avatarPath);
				setOtheruser(res);
			})
	}, []);
	*/
	if (errorCode >= 400)
		return (< FetchError code={errorCode}/>);
	return (
		<>
			<h1>Username: {otherUser?.username}</h1>
		</>
	);
}

export default UserProfileOther;