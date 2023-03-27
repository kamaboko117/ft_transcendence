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
	avatarPath: string,
	fa: boolean
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
	const [user, setUser] = useState<userInfo>();
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

	useEffect(() => {
		fetch('http://' + location.host + '/api/users/profile/', { headers: header(props.jwt) })
            .then(res => {
                if (res.ok)
                    return (res.json());
                setErrorCode(res.status);
            }).then((res: userInfo) => {
				console.log(res);
				setUser(res);
            }).catch(e=>console.log(e));
	}, []);


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
					Username: {user?.username}
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
					defaultChecked={user?.fa}
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
