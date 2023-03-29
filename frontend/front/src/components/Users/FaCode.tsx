import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from '../../contexts/UserContext';
import { userProfile } from '../Chat/ListUser';
import { FetchError, headerPost , header} from '../FetchError';

const handleChange = (event, setCode) => {
    event.preventDefault();
    const target = event?.currentTarget;

    if (target && !isNaN(target.value)) {
        setCode(Number(target.value));
    } else {
        setCode(0);
    }
} 

const handleSubmit = (event, code: number | null,
    jwt: string, userId: number,
    setErrorCode, setValid, setUser) => {
    event.preventDefault();
    const target = event?.currentTarget;

    if (!target)
        return ;
    if (code && !isNaN(code)) {
        fetch('http://' + location.host + '/api/users/valid-fa-code',
    {
        method: 'POST',
        headers: headerPost(jwt),
        body: JSON.stringify({
            code: code
        }),
    }
	).then(res => {
		if (res.ok)
			return (res.json());
		setErrorCode(res.status);
	}).then(res => {
        console.log(res)
		if (res) {
            setValid(res.valid);
            if (res.token) {
                setUser({
                    jwt: res.token.access_token,
                    username: res.username,
                    userId: userId
                });
            }
		}
	}).catch(e => console.log(e));
    } else {
        setValid(false);
    }
}

type typeState = {
    jwt: null | string,
    username: string | null,
    userId: number
}

function FaCode(props: { jwt: string }) {
    const userCtx: any = useContext(UserContext);
    const [valid, setValid] = useState<boolean | undefined>(undefined);
    const [finish, setFinish] = useState<boolean>(false);
    const [code, setCode] = useState<number | null>(null);
    const [url, setUrl] = useState<string | null>(null);
    //memorise user
    const [user, setUser] = useState<typeState>({jwt: null,
        username: null,
        userId: userCtx.getUserId()});
    const [errorCode, setErrorCode] = useState<number>(200);
    const navigate = useNavigate();

   useEffect(() => {
		const logout = async () => {
			await userCtx.logoutUser();
		}
		if (props.jwt && valid === true)
			logout();
	}, [valid, props.jwt]);

   useEffect(() => {
		const login = async () => {
			await userCtx.loginUser({
				jwt: user.jwt,
				username: user.username,
				userId: user.userId
			});
            setFinish(true);
		}
		if (user.jwt)
			login();
	}, [userCtx.getJwt()]);

    useEffect(() => {
        if (finish === true)
            navigate("/");
	}, [finish]);

    if (errorCode >= 401)
		return (<FetchError code={errorCode} />);
    return (<>
        <span>Please enter the code from your authenticator</span>
        <form onSubmit={(e) => handleSubmit(e, code, props.jwt, user.userId,
                setErrorCode, setValid, setUser)}>
            <input type="text" onChange={(e) => handleChange(e, setCode)} />
            <input type="submit" />
        </form>
        {valid === false && <span>Authenticator code is wrong</span>}
    </>);
}

export default FaCode;