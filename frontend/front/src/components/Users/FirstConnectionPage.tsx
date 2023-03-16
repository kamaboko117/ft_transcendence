import { type } from 'os';
import React, { ChangeEvent, FormEvent, useState } from 'react';

/* dans ton handler submit, y mettre le feth vers backend  */

type userInput = {
	username: string,
	FA: boolean,
	avatar: string,
}

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
	setUsername: React.Dispatch<React.SetStateAction<string> >,
	fileSet: File | undefined, FA: boolean, jwt: string | null,
	errorCode: number, setErrorCode: React.Dispatch<React.SetStateAction<number> >) {
	event.preventDefault();

	const formData = new FormData();
	if (fileSet) {
		formData.append('fileset', fileSet);
		formData.append('username', username);
		formData.append('object-fa', JSON.stringify({fa: FA}));
	}
	//pour ta dto
	// tu recevras surement
	//object-fa: {fa: boolean}
	//si t arrives pas en attendant tu fais object-fa: any mais faudra que ca soit comme au dessus car 	pas bien le any dans la validation

	//ici reste du append dans body
	//append en plus sur la page FirstCOnnection l username et 2FA activation
	console.log(fileSet);
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
		//ici traiter si tu veux l objet json
	}).catch(e => console.log(e));
}

function FirstConnectionPage(props: Readonly<{ jwt: string | null }>) {
	const [errorCode, setErrorCode] = useState<number>(200);
	const [username, setUsername] = useState<string>("");
	const [FA, setFA] = useState<boolean>(false);
	const [avatar, setavatar] = useState<string>("");
	const [file, setFile] = useState<File | undefined>();
	return(<section>
		<article>
			<form onSubmit={(event: FormEvent<HTMLFormElement>) =>
					update(event, username, setUsername, file, FA, props.jwt, errorCode, setErrorCode)}>
				<label htmlFor="username">Username</label><br />
				<input type="text" id="username" name="username" placeholder="ex: Charly"
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.currentTarget.value)} /><br/><br/>
				<input type="checkbox" id="twofactor"
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFA(prevCheck => !prevCheck)} />
				<label htmlFor="twofactor">Enable Two Factor Authentication: 2FA</label><br/><br/>
				<input type="file" name="uploadAvatar" onChange={(event: ChangeEvent<HTMLInputElement>) => ChangeHandler(event, setFile)} />
				<input type="submit" value="Submit" />
			</form>
		</article>
	</section>);
}

export default FirstConnectionPage;