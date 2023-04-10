import React, { useEffect, useState, ChangeEvent, FormEvent, useContext } from "react";
import { FetchError, header } from "../../components/FetchError";
import { useLocation, useNavigate } from "react-router-dom";
import UserContext from "../../contexts/UserContext";
import '../../css/user.css';

type userInfo = {
	username: string,
	token: string,
	userID: number,
	avatarPath: string,
	fa: boolean
}

/* display default img if not img loaded */

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

async function update(event: FormEvent<HTMLFormElement>, username: string,
	userId: number | undefined,
	fileSet: File | undefined, FA: boolean, jwt: string | null,
	setErrorCode: React.Dispatch<React.SetStateAction<number>>,
	setAvatarPath: React.Dispatch<React.SetStateAction<string | null>>,
	setLstErr: React.Dispatch<React.SetStateAction<[]>>, userCtx) {
	event.preventDefault();

	const formData = new FormData();
	if (fileSet) {
		formData.append('fileset', fileSet);
	}
	formData.append('fa', JSON.stringify({ fa: FA }));
	formData.append('username', username);
	await fetch('https://' + location.host + '/api/users/update-user',
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

				if (res.img)
					setAvatarPath(res.img);
				else
					setAvatarPath("");
				userCtx.reconnectUser({
					jwt: res.token.access_token,
					username: res.username,
					userId: userId
				});
				setLstErr([]);
			}
			else if (res.valid === false) {
				setLstErr(res.err);
			}
			setErrorCode(res.status);
		}
	}).catch(e => console.log(e));
}

const ErrorSubmit = (props: { lstErr: [] }) => {
	let i: number = 0;
	return (<>
		{props.lstErr &&
			props.lstErr.map((err) => (
				<p style={{ color: "red" }} key={++i}>{err}</p>
			))
		}
	</>);
}

function Setting(props: Readonly<{
	jwt: string | null
}>) {
	const [user, setUser] = useState<userInfo>();
	const [errorCode, setErrorCode] = useState<number>(200);
	const [lstErr, setLstErr] = useState<[]>([]);
	const [avatarPath, setAvatarPath] = useState<string | null>(null);
	const [FA, setFA] = useState<boolean>(false);
	const [oldFa, setOldFa] = useState<boolean>(false);
	const [file, setFile] = useState<File | undefined>();
	const userCtx: any = useContext(UserContext);
	const [username, setUsername] = useState<string>(userCtx.getUsername());
	const navigate = useNavigate();

	useEffect(() => {
		fetch('https://' + location.host + '/api/users/profile/', { headers: header(props.jwt) })
			.then(res => {
				if (res.ok)
					return (res.json());
				setErrorCode(res.status);
			}).then((res: userInfo) => {
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

	useEffect(() => {
		if (FA === true && oldFa === false)
			navigate("/fa-activate");
		setOldFa(FA);
	}, [userCtx.getJwt()]);
	
	const getLocation = useLocation();
	if (errorCode >= 401 && errorCode != 413)
		return (<FetchError code={errorCode} />);
	return (
		<section>
			<article>
				{getLocation.pathname === "/Setting" && <label>Username: {userCtx.getUsername()}</label>}
				<form onSubmit={(event: FormEvent<HTMLFormElement>) =>
					update(event, username,
						user?.userID, file, FA, props.jwt,
						setErrorCode, setAvatarPath, setLstErr,
						userCtx)}>
					<label>Username</label>
					<input
						type="text"
						placeholder="ex: Charly" value={username}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.currentTarget.value)}
					/>
					<label>Update avatar</label>
					<input
						type="file"
						onChange={(event: ChangeEvent<HTMLInputElement>) => ChangeHandler(event, setFile)}
					/>
					<label>
						Enable Two Factor Authentication: 2FA
					</label>
					<input
						type="checkbox"
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFA(prev => !prev)}
						checked={FA}
					/>
					{avatarPath != null && <><br /><img
						className="avatar"
						src={avatarPath}
						alt={"avatar " + user?.username}
						onError={handleImgError}
					/></>}
					<input type="submit" value="Submit" />
				</form>
				<ErrorSubmit lstErr={lstErr} />
				{errorCode === 400
					&& <p style={{ color: "red" }}>
						Wrong image file format, size or wrong type input.
					</p>
				}
				{errorCode === 413
					&& <p style={{ color: "red" }}>
						Image is too large, please upload a size inferior to 1MB.
					</p>
				}
			</article>
		</section>);
}

export default Setting;
