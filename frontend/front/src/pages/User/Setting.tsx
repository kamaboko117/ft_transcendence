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
	userId: number | undefined,
	fileSet: File | undefined, FA: boolean, jwt: string | null,
	setErrorCode: React.Dispatch<React.SetStateAction<number>>,
	setAvatarPath: React.Dispatch<React.SetStateAction<string | null>>, userCtx) {
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
			if (res.img)
				setAvatarPath(res.img);
			else
				setAvatarPath("");
			if (res.valid === true) {
				/*setPushUsername(res.username);
				setJwt(res.token.access_token);
				setErrorCode(200);
				userCtx.logoutUser();*/
				userCtx.reconnectUser({
					jwt: res.token.access_token,
					username: res.username,
					userId: userId
				});
			}
			else if (res.valid === false)
				setErrorCode(res.code);
		}
	}).catch(e => console.log(e));
}

function Setting(props: Readonly<{ jwt: string | null }>) {
	const [user, setUser] = useState<userInfo>();
	const [errorCode, setErrorCode] = useState<number>(200);
	const [username, setUsername] = useState<string>("");
	const [avatarPath, setAvatarPath] = useState<string | null>(null);
	//const [pushUsername, setPushUsername] = useState<string | null>(null);
	const [FA, setFA] = useState<boolean>(false);
	const [oldFa, setOldFa] = useState<boolean>(false);
	const [file, setFile] = useState<File | undefined>();
	const userCtx: any = useContext(UserContext);
	//const [jwt, setJwt] = useState<null | string>(null);
	//const [finish, setFinish] = useState<boolean>(false);
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
					if (res.avatarPath)
						setAvatarPath(res.avatarPath);
					else
						setAvatarPath("");
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

	/*useEffect(() => {
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
	}, [userCtx.getJwt(), jwt]);*/

	useEffect(() => {
		console.log("finish")
		//if (finish === true) {
			if (FA === true && oldFa === false)
				navigate("/fa-activate");
			//else
			//	setFinish(false);
			setOldFa(FA);
		//}
	}, [userCtx.getJwt()]);

	if (errorCode >= 401)
		return (<FetchError code={errorCode} />);
	return (
		<section>
			<article>
				<form onSubmit={(event: FormEvent<HTMLFormElement>) =>
					update(event, username,
						user?.userID, file, FA, props.jwt,
						setErrorCode, setAvatarPath, userCtx)}>
					<label>
						Username: { userCtx.getUsername() }
					</label><br />
					<input
						type="text"
						placeholder="ex: Charly"
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.currentTarget.value)}
					/><br /><br />
					<input
						type="file"
						onChange={(event: ChangeEvent<HTMLInputElement>) => ChangeHandler(event, setFile)}
					/>
					<input
						type="checkbox"
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFA(prev => !prev)}
						checked={FA}
					/>
					<label>
						Enable Two Factor Authentication: 2FA
					</label>
					
					{avatarPath != null && <><br/><img
						className="avatar"
						src={avatarPath}
						alt={"avatar " + user?.username}
						onError={handleImgError}
					/></>}
					<input type="submit" value="Submit" />
				</form>
				{errorCode === 1 && <p style={{ color: "red" }}>Username is already used.</p>}
				{errorCode === 3 && <p style={{ color: "red" }}>Username format is wrong.</p>}
				{errorCode === 4 && <p style={{ color: "red" }}>Username is too long.</p>}
				{errorCode === 400 && <p style={{ color: "red" }}>Image file format, size or wrong type input.</p>}
			</article>
		</section>);
}

export default Setting;
