import React, { useEffect, useState } from "react";

type ItemProps = {
    jwt: string | null
    //userID: number,
    //username: string,
    // email: string,
    // password: string,
}

function UserItem(props: ItemProps) {
    console.log("jwt: " + props.jwt);
    const [username, setUsername] = useState<string>("");
    let header = new Headers({
        Authorization: 'Bearer ' + props.jwt
    })
    useEffect(() => {
        fetch('http://' + location.host + '/api/users/profile/', {
            headers: header
        })
            .then(res => res.json())
            .then(res => setUsername(res.userID));
    }, [props.jwt])
    return (<div>
        <span>Hello USER ID: {username}</span>
    </div>
    )
}

export default UserItem;