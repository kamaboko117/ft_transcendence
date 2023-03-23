import React, { ChangeEvent, FormEvent, useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from '../../contexts/UserContext';
import { FetchError, header } from '../FetchError';

/* dans ton handler submit, y mettre le feth vers backend  */
/*
type userInput = {
	username: string,
	FA: boolean,
	avatar: string,
}*/

function ChangeHandler(event: ChangeEvent<HTMLInputElement>
	, setFile: React.Dispatch<React.SetStateAction<File | undefined> >) {
	event.preventDefault();
	const target = event.target;

	if (target.files && target.files.length === 1)
	{
		setFile(target.files[0]);
	}
}

const headerPost = (jwt: Readonly<string | null>) => {
    const header = new Headers({
        Authorization: 'Bearer ' + jwt,
    })
    return (header);
};

function update(event: FormEvent<HTMLFormElement>, username: string,
	setPushUsername: React.Dispatch<React.SetStateAction<string | null> >,
	fileSet: File | undefined, FA: boolean, jwt: string | null,
	setErrorCode: React.Dispatch<React.SetStateAction<number> >,
	setJwt: React.Dispatch<React.SetStateAction<null | string> >) {
	event.preventDefault();

	const formData = new FormData();
	if (fileSet) {
		formData.append('fileset', fileSet);
	}
	formData.append('fa', JSON.stringify({fa: FA}));
	formData.append('username', username);
	//pour ta dto
	// tu recevras surement
	//object-fa: {fa: boolean}
	//si t arrives pas en attendant tu fais object-fa: any mais faudra que ca soit comme au dessus car 	pas bien le any dans la validation

	//ici reste du append dans body
	//append en plus sur la page FirstCOnnection l username et 2FA activation

	//
	//je crois t as des trucs pour t aider sur ce lien https://orkhan.gitbook.io/typeorm/docs/select-query-builder
	/*cq dans backend, a mettre dans le provider user.service tu dois modifier cq pour mettre a jour l userthis.userRepository.createQueryBuilder()
            .update(User)
            .set({avatarPath: path, username: username etc}) << mettre les trucs que tu veux modifier, si ca fonctionne mal mp discord
            .where("user_id = :id")
            .setParameters({id: user_id})
            .execute()
        }*/
		//url creer une fonction dans user.controller
		//regarde la doc nestjs controller, tu dois faire une class DTO Pour valider les donnees
		//exemple dans users/dto/... si c faux tu recevras erreur 400 dans ta console client
	fetch('http://' + location.host + '/api/users/firstlogin',
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
		console.log(res)
		if (res && res.valid === true) {
			setPushUsername(res.username);
			setJwt(res.token.access_token);
		} else {
			setErrorCode(400);
		}
	}).catch(e => console.log(e));
}

function FirstConnectionPage(props: Readonly<{ jwt: string | null }>) {
	const [errorCode, setErrorCode] = useState<number>(200);
	const [jwt, setJwt] = useState<null | string>(null);
	const [username, setUsername] = useState<string>("");
	const [pushUsername, setPushUsername] = useState<string | null>(null);
	const [FA, setFA] = useState<boolean>(false);
	const [file, setFile] = useState<File | undefined>();
	const userCtx: any = useContext(UserContext);
	const navigate = useNavigate();
	const [load, setLoad] = useState<boolean>(false);
	const [userId, setUserId] = useState<number>(userCtx.getUserId());

	//check if user already have username
	useEffect(() => {
		fetch('http://' + location.host + '/api/users/first-profile/',
            { headers: header(props.jwt) })
            .then(res => {
                if (res.ok)
                    return (res.json());
                setErrorCode(res.status);
            })
            .then((res) => {
                if (res
					&& res.username != "" && res.username != null) {
					navigate('/');
                }
            }).catch(e=>console.log(e));
	}, []);

	//useEffect(() => {
		//userCtx.setUsername(pushUsername);
	//}, [pushUsername]);
	useEffect(() => {
		const logout = async () => {
			await userCtx.logoutUser();
		}
		if (jwt
			&& pushUsername && pushUsername != "")
			logout();
	}, [pushUsername]);
	useEffect(() => {
		const login = async () => {
			await userCtx.loginUser({
				jwt: jwt,
				username: username,
				userId: userId
			});
			setLoad(true);
		}
		if (jwt)
			login();
	}, [userCtx.getJwt()]);
	useEffect(() => {
		if (jwt && jwt === userCtx.getJwt() && load === true) {
			if (FA === true)
				navigate("/fa-activate");
			else {
				navigate("/");
			}
		}
	}, [load])

	if (errorCode >= 401)
		return (<FetchError code={errorCode} />);
	return(
	<section>
		<article>
			<form onSubmit={(event: FormEvent<HTMLFormElement>) =>
					update(event, username,
					setPushUsername, file, FA, props.jwt,
					setErrorCode, setJwt)}>
				<label htmlFor="username">Username</label><br />
				<input type="text" id="username" name="username" placeholder="ex: Charly"
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => {e.preventDefault();setUsername(e.currentTarget.value)}} /><br/><br/>
				<input type="checkbox" id="twofactor"
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFA(prevCheck => !prevCheck)} />
				<label htmlFor="twofactor">Enable Two Factor Authentication: 2FA</label><br/><br/>
				<input type="file" name="uploadAvatar" onChange={(event: ChangeEvent<HTMLInputElement>) => ChangeHandler(event, setFile)} />
				<input type="submit" value="Submit" />
			</form>
			{errorCode && errorCode === 400 && <span>Something is not valid, please enter inputs properly</span>}
		</article>
	</section>);
}

export default FirstConnectionPage;