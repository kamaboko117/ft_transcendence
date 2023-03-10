import { type } from 'os';
import React, { ChangeEvent, FormEvent, useState } from 'react';

/* dans ton handler submit, y mettre le feth vers backend  */

type userInput = {
	username: string,
	FA: boolean,
	avatar: string,
}

function SubmitForm() {

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

function FirstConnectionPage() {
	const [username, setUsername] = useState<string>("");
	const [FA, setFA] = useState<boolean>(false);
	const [avatar, setavatar] = useState<string>("");
	const [file, setFile] = useState<File | undefined>();
	return(<section>
		<article>
			<form /*onSubmit={SubmitForm}*/>
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