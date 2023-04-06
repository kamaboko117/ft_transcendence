import React, {useEffect, useState, ChangeEvent, FormEvent } from "react";
import { FetchError, header } from "../../components/FetchError";
import '../../css/user.css';

type statInfo = {
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

type rawMH = {
	type_game: string,
	player_one: string,
	player_two: string,
	player_victory: string
}

/* display default img if not img loaded */
const handleImgError = (e) => {
    const target: HTMLImageElement = e.target as HTMLImageElement;

    if (target) {
        target.src =  "/upload_avatar/default.png"; 
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

/* Table of Match_History */
const Match_History_Raw = (props: rawMH) => {
	const {type_game, player_one, player_two, player_victory} = props;

	return(
		<tr>
			<td>{type_game}</td>
			<td>{player_one}</td>
			<td>{player_two}</td>
			<td>{player_victory}</td>
		</tr>
	)
}

const Match_History_Table = (props: Readonly<{ jwt: string | null }>) => {
	const [raw_MH, setRaw] = useState<rawMH>();
	const [errorCode, setErrorCode] = useState<number>(200);
	if (props.jwt === null)
		return (<div>Must be logged</div>);
	useEffect(() => {
		fetch('http://' + location.host + '/api/users/get_raw_mh', {headers: header(props.jwt)})
		.then(res => {
			if (res.ok)
				return(res.json());
			setErrorCode(res.status);
		}).then((res: rawMH) => {
			if (res) {
				setRaw(res);
			}
		})
	}, [])
	return(
		<tbody>
			{}
		</tbody>
	);
}

const UserProfile = (props: Readonly<{ jwt: string | null }>) => {
	if (props.jwt === null)
		return (<div>Must be logged</div>);
	const [avatar_path, setavatar_path] = useState<string | null>(null);
	const [errorCode, setErrorCode] = useState<number>(200);
	const [user, setSstat] = useState<userInfo>();
	useEffect(() => {
		fetch('http://' + location.host + '/api/users/profile/', { headers: header(props.jwt) })
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
            }).catch(e=>console.log(e));
	}, []);
	const [vc, setVC] = useState<number>(0);
	useEffect(() => {
		fetch('http://' + location.host + '/api/users/get-victory-nb/', {headers: header(props.jwt)})
			.then(res => {
				if (res.ok)
					return (res.text())
				setErrorCode(res.status);
			}).then((res) => {
				if (res) {
					setVC(Number(res));
				}
			})
	}, [])
	const [nb_g, setNb_g] = useState<number>(0);
	const [df, setDf] = useState<number>(0);
	useEffect(() => {
		fetch('http://' + location.host + '/api/users/get-games-nb/', {headers: header(props.jwt)})
			.then(res => {
				if (res.ok)
					return(res.text())
				setErrorCode(res.status);
			}).then((res) => {
				setNb_g(Number(res));
				setDf(nb_g - vc);
			})
	})
	if (errorCode >= 400)
        return (<FetchError code={errorCode} />);

	return (
		<>
		<h1>Username: [{user?.username}]</h1>
		{avatar_path != null && <img
			className="avatar"
			src={avatar_path}
			alt={"avatar " + user?.username}
			onError={handleImgError}
		/>}
		<ul>
			<li>Nb_Games: {nb_g}</li>
			<li>Victoire: {vc}</li>
			<li>Défaite: {df}</li>
			<li>Rang: {user?.sstat.rank}</li>	
			<li>Niveau: {user?.sstat.level}</li>	
		</ul>

		</>
	);
}

export default UserProfile;

/**
 * 		<table>
			<thead>
				<tr>
					<th>Type Game</th>
					<th>Player_One</th>
					<th>Player_Two</th>
					<th>Player_Victory</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<th>Simple</th>
					<th>id: 42</th>
					<th>id: 52</th>
					<th>id: 42</th>
				</tr>
				<tr>
					<th>Custom</th>
					<th>id: 42</th>
					<th>id: 52</th>
					<th>id: 52</th>
				</tr>
			</tbody>
		</table>
 */