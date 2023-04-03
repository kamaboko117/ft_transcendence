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
                if (res.token) {
                    /*setUser({
                        jwt: res.token.access_token,
                        username: res.username,
                        userId: userId
                    });*/
                    userCtx.reconnectUser({
                        jwt: res.token.access_token,
                        username: res.username,
                        userId: userId
                    });
                }
                setValid(res.valid);
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

const CleanerCode = (props: { userCtx, user, valid }) => {
    const [finish, setFinish] = useState<boolean>(false);
    const navigate = useNavigate();

    /*useEffect(() => {
        const login = async () => {
            await props.userCtx.loginUser({
                jwt: props.user.jwt,
                username: props.user.username,
                userId: props.user.userId
            });
            //if (props.userCtx.getJwt() != null && props.userCtx.getJwt() !== "")
            setFinish(true);
        }
        //if (!props.user.jwt)
        if (props.valid === true)
            login();
    }, [props.valid, props.userCtx.getJwt()]);*/

    /*useEffect(() => {
        //if (finish === true && props.userCtx.getJwt() != null)
            navigate("/");
    }, [finish, props.userCtx.getJwt()]);*/
    return (<></>);
}

function FaCode(props: { jwt: string }) {
    const userCtx: any = useContext(UserContext);
    const [valid, setValid] = useState<boolean | undefined>(undefined);
    const [code, setCode] = useState<number | null>(null);
    //const [url, setUrl] = useState<string | null>(null);
    //memorise user
    /*const [user, setUser] = useState<typeState>({
        jwt: null,
        username: null,
        userId: userCtx.getUserId()
    });*/
    const [errorCode, setErrorCode] = useState<number>(200);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://' + location.host + '/api/users/check-fa/',
            { headers: header(props.jwt) })
            .then(res => {
                if (!res.ok)
                    setErrorCode(res.status);
            })
    }, []);

    useEffect(() => {
        if (valid === true) {
            navigate("/");
        }
    }, [userCtx.getJwt(), valid]);

   /* useEffect(() => {
        console.log(userCtx.getJwt())
        const logout = async () => {
            await userCtx.logoutUser();
        }
        if (user.jwt && valid === true) {
            logout();
        }

    }, [valid, user]);*/

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