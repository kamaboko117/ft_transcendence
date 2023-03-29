import React, { useContext } from "react";
import { Link, useMatch, useResolvedPath } from "react-router-dom";
import UserContext from "../../contexts/UserContext";

export default function NavBar() {
	const userCtx: any = useContext(UserContext);
	const path = window.location.pathname
	let jwt = userCtx.getJwt();

	if (!jwt || jwt === "")
	{
		return (
			<nav className="nav">
				<ul>
					<CustomLink to="/">Home</CustomLink>
					<CustomLink to="/login">Log In</CustomLink>
				</ul>
			</nav>
		)
	}
	return (
		<nav className="nav">
			<Link to="/profile" className="site-title">User Profile</Link>
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

function CustomLink({ to, children, ...props }) {
	const resolvedPath = useResolvedPath(to)
	const isActive = useMatch({ path: resolvedPath.pathname, end: true })

	return (
		<li className={isActive ? "active" : ""}>
			<Link to={to} {...props}>
				{children}
			</Link>
		</li>
	)
}