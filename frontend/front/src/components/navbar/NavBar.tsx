import React, { useContext } from "react";
import { Link, useLocation, useMatch, useResolvedPath } from "react-router-dom";
import UserContext from "../../contexts/UserContext";

export default function NavBar() {
	const userCtx: any = useContext(UserContext);
	const getLocation = useLocation();
	let jwt = userCtx.getJwt();

	console.log(getLocation)
	if (getLocation.pathname === "/Setting") {
		return (
			<nav>
				<Link to="/profile">User Profile</Link>
				<ul>
					<NavBarLink to="/">Home</NavBarLink>
					<NavBarLink to="/FriendList">FriendList</NavBarLink>
					<NavBarLink to="/BlackList">BlackList</NavBarLink>
					<NavBarLink to="/Setting">Setting</NavBarLink>
					<NavBarLink to="/channels">Channels</NavBarLink>
					<NavBarLink to="/matchmaking">Matchmaking</NavBarLink>
					<NavBarLink to="/logout">Log Out</NavBarLink>
				</ul>
			</nav>
		)
	}
	else if (!jwt || jwt === "") {
		return (
			<nav>
				<ul>
					<NavBarLink to="/">Home</NavBarLink>
					<NavBarLink to="/login">Log In</NavBarLink>
				</ul>
			</nav>
		)
	}
	return (
		<nav>
			<Link to="/profile">User Profile</Link>
			<ul>
				<NavBarLink to="/">Home</NavBarLink>
				<NavBarLink to="/FriendList">FriendList</NavBarLink>
				<NavBarLink to="/BlackList">BlackList</NavBarLink>
				<NavBarLink to="/Setting">Setting</NavBarLink>
				<NavBarLink to="/channels">Channels</NavBarLink>
				<NavBarLink to="/matchmaking">Matchmaking</NavBarLink>
				<NavBarLink to="/logout">Log Out</NavBarLink>
			</ul>
		</nav>
	)
}

function NavBarLink({ to, children, ...props }) {
	//const resolvedPath = useResolvedPath(to);
	//const isActive = useMatch({ path: resolvedPath.pathname, end: true });

	return (
		<li /*className={isActive ? "active" : ""}*/>
			<Link to={to} {...props}>
				{children}
			</Link>
		</li>
	)
}