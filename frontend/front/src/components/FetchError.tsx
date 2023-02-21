import React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const FetchError = (props: { code: number }) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (props.code === 403) {
            navigate("/logout");
        }
        else if (props.code >= 400)
            throw new Error('Something went wrong while fetching data');
    })
    return (<></>);
}

export const header = (jwt: Readonly<string | null>) => {
    const header = new Headers({
        Authorization: 'Bearer ' + jwt
    })
    return (header);
};

export const headerPost = (jwt: Readonly<string | null>) => {
    const header = new Headers({
	'Content-Type': 'application/json',
        Authorization: 'Bearer ' + jwt
    })
    return (header);
};
