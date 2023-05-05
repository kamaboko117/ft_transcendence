import React, { useEffect, useState } from "react";
import { header } from '../FetchError';

type ItemProps = {
    jwt: string | null
    //userID: number,
    //username: string,
    // email: string,
    // password: string,
}

function UserItem(props: ItemProps) {
    const [username, setUsername] = useState<string>("");

    useEffect(() => {
        if (props.jwt) {
            fetch('https://' + location.host + '/api/users/profile/',
            { headers: header(props.jwt) })
            .then(res => {
                if (res && res.ok)
                    return (res.json());
            })
            .then((res) => {
                if (res)
                    setUsername(res.username);
            }).catch(e=>console.log(e));
        }
    }, [props.jwt]);
    return (<div>
        <span>Hello USER ID: {username}</span>
    </div>
    )
}

export default UserItem;