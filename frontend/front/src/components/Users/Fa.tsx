import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FetchError, header } from '../FetchError';

const handleButton = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    navigate) => {
    if (event && event.target)
        navigate("/fa-code");
}

/* 0 == wait
    1 == no FA found on DB
    2 == QrCode loaded
*/
function SettingFa(props: {jwt: string}) {
    const navigate = useNavigate();
    const [waitForFa, setWaitForFa] = useState<number>(0);
    const [url, setUrl] = useState<string | null>(null);
    const [errorCode, setErrorCode] = useState<number>(200);

    useEffect(() => {
        fetch('http://' + location.host + '/api/users/set-fa/',
            { headers: header(props.jwt) })
            .then(res => {
                if (res.ok)
                    return (res.json());
                setErrorCode(res.status);
            })
            .then((res) => {
                if (res) {
                    setWaitForFa(res.code);
                    setUrl(res.url);
                }
            }).catch(e=>console.log(e));
    }, []);
    if (errorCode >= 401)
		return (<FetchError code={errorCode} />);
    return (
        <section>
            <h1>Double Authentification</h1>
            <article>
                <h2>Google Authenticator</h2>
                <p>Please, install an authenticator like Google Authenticator</p>
                {waitForFa === 2 && url &&
                    <>
                        <img src={url} alt="qrcode"/>
                        <br/><span>Please scan it on your smartphone</span>
                        <br/><button onClick={(e) => handleButton(e, navigate)}>Next</button>
                    </>
                }
                {waitForFa === 1 && <p>No qrcode available, please accept one in your setting page</p>}
                {typeof url === "undefined" && <p>No qrcode available, please accept one in your setting page</p>}
                {waitForFa === 0 && <p>Waiting for qrcode...</p>}
            </article>
        </section>
    );
}

export default SettingFa