import { updateBlackFriendList } from "../../contexts/DisplayChatContext";
import { header, headerPost } from "../FetchError";

type typeUserInfo = {
    User_username: string,
    id: number,
    fl: number | null,
    bl: number | null,
}

type typeFetchToBack = {
    channelId: string,
    action: string,
    jwt: string,
    userId: number,
    option: number | boolean
}

const fetchToBackWithTimer = (elem: typeFetchToBack) => {
    fetch('http://' + location.host + '/api/chat-role/role-action', {
        method: 'post',
        headers: headerPost(elem.jwt),
        body: JSON.stringify({
            id: elem.channelId, action: elem.action,
            option: elem.option, userId: elem.userId
        })
    })
    .then(res => {
        console.log(res)
        if (res.ok)
            return (res)
    })
    .catch(e=>console.log(e));
}

const getUserInfoByName = (jwt: string, username: string,
    setErrorCode, id: string, firstPartCmd: string, thirdPart: string) => {
    fetch('http://' + location.host + '/api/users/info-fr-bl?' + new URLSearchParams({
            name: username
        }), { headers: header(jwt) })
    .then(res => {
        if (res.ok)
            return (res.json());
        setErrorCode(res.status)
    }).then(res => {
        console.log(res)
        if (res && res.valid === true) {
            fetchToBackWithTimer({channelId: id,
                action: firstPartCmd, jwt: jwt,
                userId: Number(res.id), option: Number(thirdPart)});
        }
    })
}

const isCmdValid = (cmd: string, length: number) => {
    const arrBasicUser = [
        "block", "unblock", "friend", "unfriend", "invite",
        "profile", "pm"
    ]
    const arrAdminUser = [
        "grant", "ungrant", "ban", "unban", "mute", "unmute", "kick"
    ]

    for (let i = 0; i < arrBasicUser.length; ++i) {
        if (arrBasicUser[i] === cmd) {
            if (length != 2)
                return ({valid: false, type: ""});
            return ({valid: true, type: "user"});
        }
    }
    console.log(length)
    for (let i = 0; i < arrAdminUser.length; ++i) {
        if (arrAdminUser[i] === cmd) {
            if ((cmd === "grant" || cmd === "kick" || cmd === "unban" || cmd === "unmute")
                && length != 2)
                return ({valid: false, type: ""});
            else if ((cmd === "ban" || cmd === "mute") && length != 3)
                return ({valid: false, type: ""});
            return ({valid: true, type: "admin"});
        }
    }
    return ({valid: false, type: ""});
}

/* we take lstuserchat because we might need to update channel page part
    we also import lstuserglobal, because we can't use react hook in non componant react function
*/

export const commandChat = (jwt:string, obj: any, setErrorCode,
    lstUserGlobal, lstUserChat, setLstUserGlobal, setLstUserChat) => {
    console.log("cmd")
    const cmd = obj.content;

    const listHandle = (jwt: string,
        setErrorCode: React.Dispatch<React.SetStateAction<number>>,
        type: number, userInfo: typeUserInfo): void => {

        function updateUserInfo(username: string, id: number,
            friend: number | null, block: number | null) {
            updateBlackFriendList({
                id: id,
                fl: friend, bl: block, User_username: username
            }, lstUserGlobal, setLstUserGlobal);
            if (lstUserChat.length > 0) {
                const find = lstUserChat.find(elem => Number(elem.list_user_user_id) === id);
                if (find) {
                    const newArr = lstUserChat.map((value) => {
                        if (value && Number(value.list_user_user_id) === id) {
                            value.bl = block;
                            value.fl = friend;
                        }
                        return (value);
                    });
                    setLstUserChat(newArr);
                }
            }
        }
        fetch("http://" + location.host + "/api/users/fr-bl-list", {
            method: 'post',
            headers: headerPost(jwt),
            body: JSON.stringify({
                userId: Number(userInfo.id), type: type
            })
        }).then(res => {
            if (res.ok)
                return (res.json());
            setErrorCode(res.status);
        }).then((res: { add: boolean, type: number }) => {
            if (res) {
                if (res.add) {
                    if (res.type === 1) {
                        updateUserInfo(userInfo.User_username, Number(userInfo.id),
                            userInfo.fl, res.type);
                    } else if (res.type === 2) {
                        updateUserInfo(userInfo.User_username, Number(userInfo.id),
                            res.type, userInfo.bl);
                    }
                } else {
                    if (res.type === 1) {
                        updateUserInfo(userInfo.User_username, Number(userInfo.id),
                            userInfo.fl, null);
                    } else if (res.type === 2) {
                        updateUserInfo(userInfo.User_username, Number(userInfo.id),
                            null, userInfo.bl);
                    }
                }
            }
        }).catch(e => console.log(e));
    }

    function runUserCmd(jwt: string, firstPartCmd: string, secondPartCmd: string) {
    
        function getInfoUser(jwt: string, firstPartCmd: string, secondPartCmd: string,
            setErrorCode) {
            fetch('http://' + location.host + '/api/users/info-fr-bl?' + new URLSearchParams({
                    name: secondPartCmd
                }), { headers: header(jwt) })
            .then(res => {
                if (res.ok)
                    return (res.json());
                setErrorCode(res.status)
            })
            .then((res: any) => {
                if (res.valid && (firstPartCmd === "block" || firstPartCmd === "unblock")) {
                    listHandle(jwt, setErrorCode, 1, res);
                }
                if (res.valid && (firstPartCmd === "friend" || firstPartCmd === "unfriend")) {
                    listHandle(jwt, setErrorCode, 2, res);
                }
            }).catch(e=>console.log(e));
        }
        //get user info from db
        getInfoUser(jwt, firstPartCmd, secondPartCmd,
            setErrorCode);
    }

    function runAdminCmd(jwt: string, firstPartCmd: string, secondPartCmd: string, thirdPart: string) {
        console.log("run adm")
        fetch('http://' + location.host + '/api/chat-role/getRole?' + new URLSearchParams({
            id: obj.id,
        }), { headers: header(jwt) })
        .then(res => {
            if (res.ok)
                return (res.json());
            setErrorCode(res.status)
        })
        .then((res) => {
            console.log(res)
            if (res && res.role) {
                console.log("res with role")
                console.log(res)
                getUserInfoByName(jwt, secondPartCmd, setErrorCode,
                    obj.id, firstPartCmd, thirdPart);
                //fetchToBackWithTimer({channelId: obj.id,
                 //   action: firstPartCmd, jwt: jwt,
                   // userId: 0, option: Number(thirdPart)});
            }
            else {
                console.log("res without role")
                console.log(res)
            }
        }).catch(e=>console.log(e));
        return(true);
    }

    if (cmd && cmd[0] != '/')
        return (false);
    const split = cmd.split(" ");
    //if (split.length != 2)
    //    return (false);
    //parse cmd
    const firstPartCmd = split[0].replace('/', '');
    const secondPartCmd = split[1];
    //check command validation
    const result = isCmdValid(firstPartCmd, split.length);
    if (result.valid === false)
        return (false);
    console.log(result)
    if (result.type === "user") {
        runUserCmd(jwt, firstPartCmd, secondPartCmd);
    } else if (result.type === "admin") {
        runAdminCmd(jwt, firstPartCmd, secondPartCmd, split[2]);
    }
    return (true);
}