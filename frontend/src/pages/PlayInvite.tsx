import React, { useContext, useState } from "react";
import Game from "../components/game";
import SocketContext from '../contexts/Socket';
import { headerPost } from '../components/FetchError';
import { useParams } from "react-router-dom";

export function playPageInvite(jwt: string, setErrorCode,
    focusUserId: number, navigate) {

    async function addRoomHandler(jwt: string, setErrorCode,
        focusUserId: number) {
        await fetch("https://" + location.host + "/api/rooms/create-private", {
            method: "POST",
            body: JSON.stringify({
                id: focusUserId,
            }),
            headers: headerPost(jwt)
        })
            .then((response) => {
                if (response.ok)
                    return response.json();
                setErrorCode(response.status);
            })
            .then((data) => {
                if (data) {
                    if (!data.uid || data.uid === "")
                        return;
                    navigate({ pathname: '/play-invite/' + data.uid });
                }
            }).catch(err => console.log(err));
    }
    addRoomHandler(jwt, setErrorCode, focusUserId);
}

function PlayPageInvite(props: { jwt: string }) {
    const [errorCode, setErrorCode] = useState<number>(200);
    const id = useParams().id as string;
    const { usrSocket } = useContext(SocketContext);

    /*useEffect(() => {
        return (() => {
            
        });
    }, [id]);*/
    if (id && id != "") {
        return <Game id={id} usrSocket={usrSocket} />;
    }
    return (<span>Wrong room...</span>);
}

export default PlayPageInvite