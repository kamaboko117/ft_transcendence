import React, { ChangeEvent, FormEvent, MouseEvent, useState } from 'react';
import { Link, Outlet, useNavigate } from "react-router-dom";
import "../../css/channel.css";
import { ContextUserLeave } from '../../contexts/LeaveChannel';
import { FetchError, header, headerPost } from '../FetchError';

type State = {
    listChannel: Array<{
        channel_id: number | string,
        channel_name: string,
        User_username: string,
        channel_accesstype: number,
    }>,
    listChannelPrivate: Array<{
        channel_id: number | string,
        channel_name: string,
        User_username: string,
        channel_accesstype: number,
    }>,
    channelName: string,
    privateChannelName: string,
    rad: string,
    password: string,
    passwordPrivate: string,
    hasError: boolean,
    listError: [],
    privateIdChannel: string,
    errorCode: number
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
}



const onSubmitJoin = async (e: FormEvent<HTMLFormElement>, name: string | null, navigate: any) => {
    e.preventDefault();
    navigate({ pathname: "/channels/" + name }, { state: { name: name, username: "" } });
}

const OpenPrivateChat = () => {
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

class ListChannel extends React.Component<{ jwt: string | null }, State> {
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
            privateIdChannel: '',
            errorCode: 200
        }
        this.onClick = this.onClick.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }
    componentDidMount = (): void => {
        fetch('http://' + location.host + '/api/chat/public/',
            { headers: header(this.props.jwt) })
            .then(res => {
                console.log(res.ok);
                if (res.ok)
                    return (res.json());
                this.setState({
                    errorCode: res.status
                });
            }).then(res => {
                console.log(res);
                this.setState({
                    listChannel: res
                })
            }).catch(e => console.log(e));
        fetch('http://' + location.host + '/api/chat/private',
            { headers: header(this.props.jwt) }).then(res => {
                if (res.ok)
                    return (res.json());
                this.setState({
                    errorCode: res.status
                });
            }).then(res => {
                this.setState({
                    listChannelPrivate: res
                })
            }).catch(e => console.log(e));
    }

    componentWillUnmount(): void {
        this.setState({
            listChannel: [],
            listChannelPrivate: []
        })
    }
    onClick = (): void => {
        fetch('http://' + location.host + '/api/chat/public/',
            { headers: header(this.props.jwt) })
            .then(res => {
                if (res.ok)
                    return (res.json());
            }).then(res => {
                this.setState({
                    listChannel: res
                })
            }).catch(e => console.log(e))
        fetch('http://' + location.host + '/api/chat/private',
            { headers: header(this.props.jwt) }).then(res => {
                if (res.ok)
                    return (res.json());
                this.setState({
                    errorCode: res.status
                });
            }).then(res => {
                this.setState({
                    listChannelPrivate: res
                })
            }).catch(e => console.log(e))
    }
    onChange = (e: ChangeEvent<HTMLInputElement>): void => {
        e.stopPropagation();
        const name = e.currentTarget.name;
        const value = e.currentTarget.value;
        this.setState((prevState => (
            { ...prevState, [name]: value }
        )));
    };

    onSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();

        if (this.state.rad == "0") {
            const res: any = fetch('http://' + location.host + '/api/chat/new-public/', {
                method: 'post',
                headers: headerPost(this.props.jwt),
                body: JSON.stringify({
                    id: '0', //à supprimer
                    name: this.state.channelName,
                    accesstype: this.state.rad,
                    password: this.state.password,
                    lstMsg: [],
                    lstUsr: {},
                    lstMute: {},
                    lstBan: {}
                })
            }).then(res => {
                if (res.ok)
                    return (res.json())
                this.setState({
                    errorCode: res.status
                });
            }).then(res => {
                if (Array.isArray(res) === true) {
                    this.setState({ hasError: true, listError: res });
                }
                else {
                    this.setState({
                        hasError: false, listError: [],
                        listChannel: [...this.state.listChannel, res],
                    });
                }
            }).catch(e => console.log(e));
        }
        else {
            const res: any = fetch('http://' + location.host + '/api/chat/new-private/', {
                method: 'post',
                headers: headerPost(this.props.jwt),
                body: JSON.stringify({
                    id: '0',
                    name: this.state.channelName,
                    accesstype: this.state.rad,
                    password: this.state.password,
                    lstMsg: [],
                    lstUsr: {},
                    lstMute: {},
                    lstBan: {}
                })
            }).then(res => {
                if (res.ok)
                    return (res.json());
                this.setState({
                    errorCode: res.status
                });
            }).then(res => {
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
            }).catch(e => console.log(e));
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
                        <td><Link to={{ pathname: "/channels/" + chan.channel_id }} state={{ name: chan.channel_name, username: "" }}>{chan.channel_name}</Link></td><td>{chan.User_username}</td><td><TypeAccess access={chan.channel_accesstype} /></td>
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
            return (<>Password required</>);
        };
        return (<tbody>
            {this.state.listChannelPrivate &&
                this.state.listChannelPrivate.map((chan) => (
                    <tr key={++i}>
                        <td><Link to={{ pathname: "/channels/" + chan.channel_id }}
                            state={{ name: chan.channel_name, username: "" }}>{chan.channel_name}</Link>
                        </td>
                        <td>{chan.User_username}</td>
                        <td><TypeAccess access={chan.channel_accesstype} /></td>
                    </tr>
                ))
            }
        </tbody>)
    }

    render(): JSX.Element {
        if (this.state.errorCode >= 400)
            return (<FetchError code={this.state.errorCode} />)
        return (<section className='containerChannel'>
            <h1>List channels + (affichage liste privée à faire + persist dtb)</h1>
            <article className='left'>
                <table className='left'>
                    <thead>
                        <tr>
                            <th style={{ width: "60%" }}>Public Channel name</th>
                            <th style={{ width: "20%" }}>Owner</th>
                            <th style={{ width: "20%" }}>Access type</th>
                        </tr>
                    </thead>
                    <this.PrintListPublic />
                </table>
                <table className='right'>
                    <thead>
                        <tr>
                            <th style={{ width: "60%" }}>Private Channel name</th>
                            <th style={{ width: "20%" }}>Owner</th>
                            <th style={{ width: "20%" }}>Access type</th>
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
