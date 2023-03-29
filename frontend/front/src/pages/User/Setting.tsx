/*
import React from "react";

export default function Setting() {
	return <h1>Setting</h1>
}
*/
import React, { useEffect, useState, ChangeEvent, FormEvent, useContext } from "react";
import { FetchError, header } from "../../components/FetchError";
import { useNavigate } from "react-router-dom";
import UserContext from "../../contexts/UserContext";
import '../../css/user.css';


type userInfo = {
	username: string,
	token: string,
	userID: number,
	avatarPath: string,
	fa: boolean
}

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

function ChangeHandler(event: ChangeEvent<HTMLInputElement>
	, setFile: React.Dispatch<React.SetStateAction<File | undefined>>) {
	event.preventDefault();
	const target = event.target;

	if (target.files && target.files.length === 1) {
		setFile(target.files[0]);
	}
}

/*function checkUsername(event: FormEvent<HTMLFormElement>, username: string,
	setPushUsername: React.Dispatch<React.SetStateAction<string | null> >,
	fileSet: File | undefined, FA: boolean, jwt: string | null,
	setErrorCode: React.Dispatch<React.SetStateAction<number> >) {
		event.preventDefault();
		const formData = new FormData();
		formData.append('username', username);
		console.log(fileSet);
		fetch('http://' + location.host + '/api/users/get-username',
		{ headers: header(jwt) }
		)
		.then(res => {
			console.log(res);
			if (res.ok)
				return (res.json());
		})
		.then(res => {
			console.log(res)
			if ()
			*//*if (res.ok) {
console.log("Username find");
} else {
update(event, username, setPushUsername, fileSet, FA, jwt, setErrorCode);
}*/
/*})
}*/

async function update(event: FormEvent<HTMLFormElement>, username: string,
	setPushUsername: React.Dispatch<React.SetStateAction<string | null>>,
	setJwt: React.Dispatch<React.SetStateAction<string | null>>,
	fileSet: File | undefined, FA: boolean, jwt: string | null,
	setErrorCode: React.Dispatch<React.SetStateAction<number>>, userCtx) {
	event.preventDefault();

	const formData = new FormData();
	if (fileSet) {
		formData.append('fileset', fileSet);
	}
	formData.append('fa', JSON.stringify({ fa: FA }));
	formData.append('username', username);
	console.log(fileSet);
	console.log(jwt)
	await fetch('http://' + location.host + '/api/users/update-user',
		{
			method: 'POST',
			headers: headerPost(jwt),
			body: formData,
		}
	).then(res => {
		if (res.ok)
			return (res.json());
		setErrorCode(res.status);
	}).then(res => {
		if (res) {
			console.log(res)
			if (res.valid === true) {
				setPushUsername(res.username);
				setJwt(res.token.access_token);
				setErrorCode(200);
				userCtx.logoutUser();
			}
			else if (res.valid === false && res.code === 1)
				setErrorCode(1);
			else if (res.valid === false && res.code === 2)
				setErrorCode(2);
		}
	}).catch(e => console.log(e));
}

function Setting(props: Readonly<{ jwt: string | null }>) {
	const [user, setUser] = useState<userInfo>();
	const [errorCode, setErrorCode] = useState<number>(200);
	const [username, setUsername] = useState<string>("");
	const [pushUsername, setPushUsername] = useState<string | null>(null);
	const [FA, setFA] = useState<boolean>(false);
	const [oldFa, setOldFa] = useState<boolean>(false);
	const [file, setFile] = useState<File | undefined>();
	const userCtx: any = useContext(UserContext);
	const [jwt, setJwt] = useState<null | string>(null);
	const [finish, setFinish] = useState<boolean>(false);
	const navigate = useNavigate();

	useEffect(() => {
		fetch('http://' + location.host + '/api/users/profile/', { headers: header(props.jwt) })
			.then(res => {
				if (res.ok)
					return (res.json());
				setErrorCode(res.status);
			}).then((res: userInfo) => {
				console.log(res);
				if (res) {
					setUser(res);
					setFA(res.fa);
					setOldFa(res.fa);
				}
			}).catch(e => console.log(e));
	}, []);

	/*useEffect(() => {
		const logout = async () => {
			await userCtx.logoutUser();
		}
		if (jwt
			&& pushUsername && pushUsername != "")
			logout();
	}, [jwt]);*/

	useEffect(() => {
		const login = async () => {
			console.log("login")
			await userCtx.loginUser({
				jwt: jwt,
				username: pushUsername,
				userId: user?.userID
			});
			setFinish(true);
		}
		if (!userCtx.getJwt() && jwt)
			login();
	}, [userCtx.getJwt(), jwt]);

	useEffect(() => {
		if (finish === true) {
			if (FA === true && oldFa === false)
				navigate("/fa-activate");
			else
				setFinish(false);
			setOldFa(FA);
		}
	}, [finish]);

	if (errorCode >= 401)
		return (<FetchError code={errorCode} />);
	return (
		<section>
			<article>
				<form onSubmit={(event: FormEvent<HTMLFormElement>) =>
					update(event, username,
						setPushUsername, setJwt, file, FA, props.jwt,
						setErrorCode, userCtx)}>
					<label htmlFor="username">
						Username: {(pushUsername === null ? user?.username : pushUsername)}
					</label><br />
					<input
						type="text"
						id="username"
						name="username"
						placeholder="ex: Charly"
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.currentTarget.value)}
					/><br /><br />
					<input
						type="file"
						name="uploadAvatar"
						onChange={(event: ChangeEvent<HTMLInputElement>) => ChangeHandler(event, setFile)}
					/>
					<input
						type="checkbox"
						id="twofactor"
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFA(prev => !prev)}
						checked={FA}
					/>
					<label htmlFor="twofactor">
						Enable Two Factor Authentication: 2FA
					</label><br /><br />
					<input type="submit" value="Submit" />
				</form>
				{errorCode === 1 && <p style={{ color: "red" }}>Username is already used.</p>}
			</article>
		</section>);
}

export default Setting;
