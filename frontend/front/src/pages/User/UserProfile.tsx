import React, {useEffect, useState} from "react";

type userInfo = {
	username: string,
	token: string,
	userID: number
}

const header = (props: Readonly<{ jwt: string | null }>) => {
    const header = new Headers({
        Authorization: 'Bearer ' + props.jwt
    })
	console.log(props.jwt);
    return (header);
};

export default function UserProfile(props: Readonly<{ jwt: string | null }>) {
	if (props.jwt === null)
		return (<div>Must be logged</div>);
	const [username, setUsername] = useState<string | null>(null);
	useEffect(() => {
		fetch('http://' + location.host + '/api/users/profile/', { headers: header(props) })
            .then(res => {
                if (res.ok)
                    return (res.json());
                throw new Error('Server is not running.');
            }).then((res: userInfo) => {
                setUsername(res.username);
            })
	})
	return (
		<>
		<h1>Username: {username}</h1>
		<ul>
			<li>Victoire: </li>
			<li>Défaite: </li>	
			<li>Match Blanc (Victoire): </li>		
			<li>Match Blanc (Défaite): </li>		
		</ul>
		</>
	);
}