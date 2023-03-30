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

/*
function ChangeHandler(event: ChangeEvent<HTMLInputElement>
	, setFile: React.Dispatch<React.SetStateAction<File | undefined> >) {
	event.preventDefault();
	const target = event.target;

	if (target.files && target.files.length === 1)
	{
		setFile(target.files[0]);
	}
}
*/

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
*/

const UserProfile = (props: Readonly<{ jwt: string | null }>) => {
	if (props.jwt === null)
		return (<div>Must be logged</div>);
	const [avatar_path, setavatar_path] = useState<string>("");
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
				if (res && res.avatarPath)
                	setavatar_path(res.avatarPath);
				setSstat(res);
            }).catch(e=>console.log(e));
	}, []);
	if (errorCode >= 400)
        return (<FetchError code={errorCode} />);
	return (
		<>
		<h1>Username: [{user?.username}]</h1>
		< img
			className="avatar"
			src={avatar_path}
			alt={"avatar " + user?.username}
			onError={handleImgError}
		/>
		<ul>
			<li>Victoire: {user?.sstat.victory}</li>
			<li>Défaite: {user?.sstat.defeat}</li>	
			<li>Rang: {user?.sstat.rank}</li>		
			<li>Niveau: {user?.sstat.level}</li>		
		</ul>
		</>
	);
}

export default UserProfile;