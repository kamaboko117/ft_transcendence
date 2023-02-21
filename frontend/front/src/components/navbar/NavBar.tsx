import React from "react";
import { Link, useMatch, useResolvedPath } from "react-router-dom";

export default function NavBar() {
	const path = window.location.pathname
	return (
		<nav className="nav">
			<Link to="/profile" className="site-title">User Profile</Link>
			<ul>
				<CustomLink to="/">Home</CustomLink>
				<CustomLink to="/FriendList">FriendList</CustomLink>
				<CustomLink to="/BlackList">BlackList</CustomLink>
				<CustomLink to="/Setting">Setting</CustomLink>
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