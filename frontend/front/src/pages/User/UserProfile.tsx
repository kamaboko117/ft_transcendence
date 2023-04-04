import React, {useEffect, useState, ChangeEvent, FormEvent } from "react";
import { FetchError, header } from "../../components/FetchError";
import '../../css/user.css';

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
	if (errorCode >= 400)
        return (<FetchError code={errorCode} />);

	/**
	 * Avec MatchHistory, extraire le [nombre de partie] joué en selectionnant uniquement 2 colonnes (p1 & p2)
	 * Avec MatchHistory, extraire le [nombre de victoire] en selectionnant uniquement la colonne user_victory
	 * [Défaite] = [nombre de partie] - [nombre de victoire]
	 */
	const vc = user?.sstat.victory;
	const nb_g = user?.sstat.nb_games;
	let df = 0;
	if (nb_g && vc) {
		df = nb_g - vc;
	}
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
		</>
	);
}

export default UserProfile;