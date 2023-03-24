/*
import React from "react";

export default function Setting() {
	return <h1>Setting</h1>
}
*/
import React, {useEffect, useState, ChangeEvent, FormEvent, useContext } from "react";
import { FetchError, header } from "../../components/FetchError";
import { useNavigate } from "react-router-dom";
import UserContext from "../../contexts/UserContext";
import '../../css/user.css';


type userInfo = {
	username: string,
	token: string,
	userID: number,
	avatarPath: string
}

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

function ChangeHandler(event: ChangeEvent<HTMLInputElement>
	, setFile: React.Dispatch<React.SetStateAction<File | undefined> >) {
	event.preventDefault();
	const target = event.target;

	if (target.files && target.files.length === 1)
	{
		setFile(target.files[0]);
	}
}

/*
function UploadForm(event: FormEvent<HTMLFormElement>,
	fileSet: File | undefined, jwt: string,
	setErrorCode: React.Dispatch<React.SetStateAction<number> >,
	setavatar_path: React.Dispatch<React.SetStateAction<string> >,
	) {
	event.preventDefault();
	if (typeof fileSet === "undefined" || !fileSet) {
		return;
	}

	const formData = new FormData();

	formData.append('fileset', fileSet);
	//append en plus sur la page FirstCOnnection l username et 2FA activation
	console.log(fileSet);
	fetch('http://' + location.host + '/api/users/avatarfile',
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
		setavatar_path(res.path);
	}).catch(e => console.log(e));
}
*/

/*
function FormUpdateUser(props: {jwt: string,
	setErrorCode: React.Dispatch<React.SetStateAction<number> >,
	setavatar_path: React.Dispatch<React.SetStateAction<string> >,
}) {
	const [file, setFile] = useState<File | undefined>();
	
	return (
		<>
		{file && <><h2>Preview avatar</h2>
			<img alt="preview avatar"
			className="avatar"src={URL.createObjectURL(file)} /></>}
			<form encType="multipart/form-data" onSubmit={(event: FormEvent<HTMLFormElement>) =>
				UploadForm(event,
					file, props.jwt,
					props.setErrorCode, props.setavatar_path)}>
					<input type="file" name="uploadAvatar"
						onChange={(event: ChangeEvent<HTMLInputElement>) => ChangeHandler(event, setFile)} />
					<input type="submit" value="Update avatar"/>
			</form>
		</>
	);
}

const Setting = (props: Readonly<{ jwt: string | null }>) => {
	if (props.jwt === null)
		return (<div>Must be logged</div>);
	const [avatar_path, setavatar_path] = useState<string>("");
	/*
	const [username, setUsername] = useState<string | null>(null);
	const [victory, setVictory] = useState<number>();
	const [defeat, setDefeat] = useState<number>();
	*/
	/*
	const [errorCode, setErrorCode] = useState<number>(200);
	const [user, setSstat] = useState<userInfo>();
	useEffect(() => {
		fetch('http://' + location.host + '/api/users/profile/', { headers: header(props.jwt) })
            .then(res => {
                if (res.ok)
                    return (res.json());
                setErrorCode(res.status);
            }).then((res: userInfo) => {
				console.log(res);
                setavatar_path(res?.avatarPath);
				/*
				setUsername(res?.username);
				setVictory(res?.sstat.victory);
				setDefeat(res?.sstat.defeat);
				*/
				/*
				setSstat(res);
            }).catch(e=>console.log(e));
	}, []);
	if (errorCode >= 400)
        return (<FetchError code={errorCode} />);
	return (
		<>
		<FormUpdateUser jwt={props.jwt} setavatar_path={setavatar_path}
			setErrorCode={setErrorCode} />
		<h1>Username: {user?.username}</h1>
		<img className="avatar" src={avatar_path} alt={"avatar " + user?.username}
			onError={handleImgError}
		/>
		</>
	);
}

export default Setting;
*/
function update(event: FormEvent<HTMLFormElement>, username: string,
	setPushUsername: React.Dispatch<React.SetStateAction<string | null> >,
	fileSet: File | undefined, FA: boolean, jwt: string | null,
	setErrorCode: React.Dispatch<React.SetStateAction<number> >) {
	event.preventDefault();

	const formData = new FormData();
	if (fileSet) {
		formData.append('fileset', fileSet);
	}
	formData.append('fa', JSON.stringify({fa: FA}));
	formData.append('username', username);
	console.log(fileSet);
	fetch('http://' + location.host + '/api/users/update-user',
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
		if (res && res.valid === true)
			setPushUsername(res.username)
	}).catch(e => console.log(e));
}

function Setting(props: Readonly<{ jwt: string | null }>) {
	const [errorCode, setErrorCode] = useState<number>(200);
	const [username, setUsername] = useState<string>("");
	const [pushUsername, setPushUsername] = useState<string | null>(null);
	const [FA, setFA] = useState<boolean>(false);
	//const [avatar, setavatar] = useState<string>("");
	const [file, setFile] = useState<File | undefined>();
	const userCtx: any = useContext(UserContext);
	const navigate = useNavigate();
	//check if username is not empty, if not
	//redirect to main page
	useEffect(() => {
		userCtx.setUsername(pushUsername);
		if (pushUsername && pushUsername != ""
			|| props.jwt === "" || props.jwt == null)
			navigate("/");
	}, [props.jwt, pushUsername]);

	if (errorCode >= 401)
		return (<FetchError code={errorCode} />);
	return(
	<section>
		<article>
			<form onSubmit={(event: FormEvent<HTMLFormElement>) =>
					update(event, username,
					setPushUsername, file, FA, props.jwt,
					setErrorCode)}>
				<label htmlFor="username">
					Username
				</label><br />
				<input
					type="text"
					id="username"
					name="username"
					placeholder="ex: Charly"
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.currentTarget.value)}
				/><br/><br/>
				<input
					type="file"
					name="uploadAvatar"
					onChange={(event: ChangeEvent<HTMLInputElement>) => ChangeHandler(event, setFile)}
				/>
				<input
					type="checkbox"
					id="twofactor"
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFA(prevCheck => !prevCheck)}
				/>
				<label htmlFor="twofactor">
					Enable Two Factor Authentication: 2FA
				</label><br/><br/>
				<input type="submit" value="Submit" />
			</form>
		</article>
	</section>);
}

export default Setting;