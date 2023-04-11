import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from '../../contexts/UserContext';
import { FetchError, headerPost, header } from '../FetchError';

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
    jwt: string, userId: number, userCtx,
    setErrorCode, setValid) => {
    event.preventDefault();
    const target = event?.currentTarget;

    if (!target)
        return;
    if (code && !isNaN(code)) {
        fetch('https://' + location.host + '/api/users/valid-fa-code',
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
            if (res) {
                if (res.token) {
                    userCtx.reconnectUser({
                        jwt: res.token.access_token,
                        username: res.username,
                        userId: userId
                    });
                }
                setValid(res.valid);
            }
        }).catch(e => {
            console.log(e);
            setValid(false);
        });
    } else {
        setValid(false);
    }
}

function FaCode(props: { jwt: string }) {
    const userCtx: any = useContext(UserContext);
    const [valid, setValid] = useState<boolean | undefined>(undefined);
    const [code, setCode] = useState<number | null>(null);
    const [errorCode, setErrorCode] = useState<number>(200);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('https://' + location.host + '/api/users/check-fa/',
            { headers: header(props.jwt) })
            .then(res => {
                if (!res.ok)
                    setErrorCode(res.status);
            }).catch(err => console.log(err));
    }, []);

    useEffect(() => {
        if (valid === true) {
            navigate("/");
        }
    }, [userCtx.getJwt(), valid]);

    if (errorCode >= 401)
        return (<FetchError code={errorCode} />);
    return (<>
        <span>Please enter the code from your authenticator</span>
        <form onSubmit={(e) => handleSubmit(e, code, props.jwt, userCtx.getUserId(), userCtx,
            setErrorCode, setValid)}>
            <input type="text" onChange={(e) => handleChange(e, setCode)} />
            <input type="submit" />
        </form>
        {valid === false && <span>Authenticator code is wrong</span>}
    </>);
}

export default FaCode;