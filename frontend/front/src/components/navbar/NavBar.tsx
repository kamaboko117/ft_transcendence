import React, { useContext } from "react";
import { Link, useMatch, useResolvedPath } from "react-router-dom";
import UserContext from "../../contexts/UserContext";

export default function NavBar() {
	const userCtx: any = useContext(UserContext);
	let jwt = userCtx.getJwt();

	if (!jwt || jwt === "") {
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
				<CustomLink to="/">Home</CustomLink>
				<CustomLink to="/FriendList">FriendList</CustomLink>
				<CustomLink to="/BlackList">BlackList</CustomLink>
				<CustomLink to="/Setting">Setting</CustomLink>
				<CustomLink to="/channels">Channels</CustomLink>
				<CustomLink to="/logout">Log Out</CustomLink>
				<CustomLink to="/matchmaking">Matchmaking</CustomLink>
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