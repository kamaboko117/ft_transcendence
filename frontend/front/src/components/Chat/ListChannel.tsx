import React, { ChangeEvent, FormEvent, MouseEvent, useState } from 'react';
import { Link, Outlet, useNavigate } from "react-router-dom";
import "../../css/channel.css";
import { ContextUserLeave } from '../../contexts/LeaveChannel';

type State = {
    listChannel: Array<{
        id: number | string,
        name: string,
        owner: string,
        accesstype: number,
    }>,
    listChannelPrivate: Array<{
        id: number | string,
        name: string,
        owner: string,
        accesstype: number,
    }>,
    channelName: string,
    privateChannelName: string,
    rad: string,
    password: string,
    passwordPrivate: string,
    hasError: boolean,
    listError: [],
    //hasErrorExist: boolean,
    privateIdChannel: string
}

type Props = {
    access: number,
}

const ErrorSubmit = (props: any) => {
    let i: number = 0;
    return (<div>
        {props.listError &&
            props.listError.map((err) => (
                <p style={{ color: "red" }} key={++i}>{err}</p>
            ))
        }
    </div>)
    return (<></>);
}

const onSubmitJoin = async (e: FormEvent<HTMLFormElement>, name: string | null, navigate: any) => {
    e.preventDefault();
    navigate({ pathname: "/channels/" + name }, { state: { name: name, username: "" } });
}

const OpenPrivateChat = (props: any) => {
    const navigate = useNavigate();
    const [name, setName] = useState<string | null>(null);

    return (<form onSubmit={(e: FormEvent<HTMLFormElement>) => onSubmitJoin(e, name, navigate)}>
        <label>Enter a channel ID to join a channel
            <input type="text"
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setName(e.currentTarget.value)}
                placeholder='Enter channel name'
                name="privateChannelName"
            />
        </label>
        <input type="submit" value="Join channel" />
    </form>);
}

class ListChannel extends React.Component<{}, State> {
    constructor(props: any) {
        super(props);
        this.state = {
            listChannel: [],
            listChannelPrivate: [],
            channelName: '',
            privateChannelName: '',
            rad: '0',
            password: '',
            passwordPrivate: '',
            hasError: false,
            listError: [],
            //hasErrorExist: false,
            privateIdChannel: ''
        }
        this.onClick = this.onClick.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }
    componentDidMount = (): void => {
        fetch('http://' + location.host + '/api/chat/public/')
            .then(res => {
                if (res.ok)
                    return (res.json());
                throw new Error('Server is not running.');
            }).then(res => {
                this.setState({
                    listChannel: res
                })
            })
        fetch('http://' + location.host + '/api/chat/private?' + new URLSearchParams({
            id: window.navigator.userAgent
        })).then(res => {
            if (res.ok)
                return (res.json());
            throw new Error('Server is not running.');
        }).then(res => {
            this.setState({
                listChannelPrivate: res
            })
        })
    }

    componentWillUnmount(): void {
        this.setState({
            listChannel: [],
            listChannelPrivate: []
        })
    }
    onClick = (): void => {
        fetch('http://' + location.host + '/api/chat/public/')
            .then(res => {
                if (res.ok)
                    return (res.json());
                throw new Error('Server is not running.');
            }).then(res => {
                this.setState({
                    listChannel: res
                })
            })
        fetch('http://' + location.host + '/api/chat/private?' + new URLSearchParams({
            id: window.navigator.userAgent
        })).then(res => {
            if (res.ok)
                return (res.json());
            throw new Error('Server is not running.');
        }).then(res => {
            this.setState({
                listChannelPrivate: res
            })
        })
    }
    onChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const name = e.currentTarget.name;
        const value = e.currentTarget.value;
        this.setState((prevState => (
            { ...prevState, [name]: value }
        )));
    };

    onSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        //let elem = new Map<string, number>;

        /* Can't send a map to HTTP REQUEST so need convert */
        if (this.state.rad == "0") {
            const res: any = fetch('http://' + location.host + '/api/chat/new-public/', {
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: '0', //m'en souviens pas
                    name: this.state.channelName,
                    owner: { idUser: window.navigator.userAgent, username: window.navigator.userAgent },
                    accesstype: this.state.rad,
                    password: this.state.password,
                    lstMsg: [],
                    lstUsr: {},
                    //setMute: {key: "test", value: 123},
                    //setBan: {key: "test2", value: 1234},
                    lstMute: {},
                    lstBan: {}
                })
            }).then(res => res.json()).then(res => {
                if (Array.isArray(res) === true) {
                    this.setState({ hasError: true, listError: res });
                }
                else {
                    this.setState({
                        hasError: false, listError: [],
                        listChannel: [...this.state.listChannel, res],
                    });
                }
                /*if (res.length === 1
                    && (res[0] === "hasErrorPsw" || res[0] === "hasErrorExist")) {
                    if (res[0] === "hasErrorPsw")
                        this.setState({ hasErrorPsw: true, hasErrorExist: false });
                    if (res[0] === "hasErrorExist")
                        this.setState({ hasErrorPsw: false, hasErrorExist: true });
                } else if (res.length === 2 && res[0] === "hasErrorPsw" && res[1] === "hasErrorExist")
                    this.setState({ hasErrorPsw: true, hasErrorExist: true });
                else {
                    this.setState({
                        listChannel: [...this.state.listChannel, res],
                        hasErrorPsw: false, hasErrorExist: false
                    });
                }*/
            });
        }
        else {
            const res: any = fetch('http://' + location.host + '/api/chat/new-private/', {
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: '0', //idUser
                    name: this.state.channelName,
                    owner: { idUser: window.navigator.userAgent, username: window.navigator.userAgent },
                    accesstype: this.state.rad,
                    password: this.state.password,
                    lstMsg: [],
                    lstUsr: {},
                    lstMute: {},
                    lstBan: {}
                })
            }).then(res => res.json()).then(res => {
                console.log(res);
                if (Array.isArray(res) === true) {
                    this.setState({ hasError: true, listError: res });
                }
                else {
                    this.setState({
                        hasError: false, listError: [],
                        listChannelPrivate: [...this.state.listChannelPrivate, res],
                        privateIdChannel: res.id
                    });
                }
                /*if (res.length === 1
                    && (res[0] === "hasErrorPsw" || res[0] === "hasErrorExist")) {
                    if (res[0] === "hasErrorPsw")
                        this.setState({ hasErrorPsw: true, hasErrorExist: false });
                    if (res[0] === "hasErrorExist")
                        this.setState({ hasErrorPsw: false, hasErrorExist: true });
                } else if (res.length === 2 && res[0] === "hasErrorPsw" && res[1] === "hasErrorExist")
                    this.setState({ hasErrorPsw: true, hasErrorExist: true });
                else
                    this.setState({
                        listChannelPrivate: [...this.state.listChannelPrivate, res],
                        hasErrorPsw: false, hasErrorExist: false,
                        privateIdChannel: res.id
                    });*/
            });
        }
    }
    PrintListPublic = (): JSX.Element => {
        let i: number = 0;
        const TypeAccess = (props: Props): JSX.Element => {
            const access: Readonly<number> = props.access;
            if (access == 0)
                return (<>Public</>)
            return (<>Password required</>)
        };

        return (<tbody>
            {this.state.listChannel &&
                this.state.listChannel.map((chan) => (
                    <tr key={++i}>
                        <td><Link to={{ pathname: "/channels/" + chan.id }} state={{ name: chan.name, username: "" }}>{chan.name}</Link></td><td>{chan.owner}</td><td><TypeAccess access={chan.accesstype} /></td>
                    </tr>
                ))
            }
        </tbody>)
    }
    PrintListPrivate = (): JSX.Element => {
        let i: number = 0;
        const TypeAccess = (props: Props): JSX.Element => {
            const access: Readonly<number> = props.access;
            if (access == 2)
                return (<>Private</>)
            return (<>Password required</>)
        };
        return (<tbody>
            {this.state.listChannelPrivate &&
                this.state.listChannelPrivate.map((chan) => (
                    <tr key={++i}>
                        <td><Link to={{ pathname: "/channels/" + chan.id }} state={{ name: chan.name, username: "" }}>{chan.name}</Link></td><td>{chan.owner}</td><td><TypeAccess access={chan.accesstype} /></td>
                    </tr>
                ))
            }
        </tbody>)
    }
    render(): JSX.Element {
        return (<section className='containerChannel'>
            <h1>List channels + (affichage liste privée à faire + persist dtb)</h1>
            <article className='left'>
                <table>
                    <thead>
                        <tr>
                            <th>Public Channel name</th><th>Owner</th><th>Access type</th>
                        </tr>
                    </thead>
                    <this.PrintListPublic />
                </table>
                <table style={{ margin: "auto auto auto 20px" }}>
                    <thead>
                        <tr>
                            <th>Private Channel name</th><th>Owner</th><th>Access type</th>
                        </tr>
                    </thead>
                    <this.PrintListPrivate />
                </table>
            </article>
            <article className='bottom'>
                <button onClick={this.onClick}>Update</button>
                <form onSubmit={this.onSubmit}>
                    <input type="text" onChange={this.onChange} placeholder='Enter channel name' name="channelName" />
                    <label><input type="radio" onChange={this.onChange} name="rad" value="0" checked={this.state.rad === "0"} />Public</label>
                    <label><input type="radio" onChange={this.onChange} name="rad" value="2" checked={this.state.rad === "2"} />Private</label>
                    <input type="text" onChange={this.onChange} placeholder='Password' name="password" />
                    <input type="submit" onChange={this.onChange} value="Add Channel" />
                </form>
                <OpenPrivateChat />
                <div><label>New private channel ID</label><span style={{ color: "#FA6405" }}>{this.state.privateIdChannel}</span></div>
                <ErrorSubmit hasError={this.state.hasError} listError={this.state.listError} />
            </article>
            <ContextUserLeave.Provider value={this.onClick}>
                <Outlet />
            </ContextUserLeave.Provider>
        </section>);
    }
}

export default ListChannel;