import React from "react";
import { Link, useMatch, useResolvedPath } from "react-router-dom";

export default function NavBar() {
	const path = window.location.pathname
	return (
		<nav className="nav">
			<Link to="/profile" className="site-title">User Profile</Link>
			<ul className="navbar">
				<CustomLink to="/">Home</CustomLink>
				<CustomLink to="/FriendList">FriendList</CustomLink>
				<CustomLink to="/BlackList">BlackList</CustomLink>
				<CustomLink to="/Setting">Setting</CustomLink>
				<CustomLink to="/play">Play</CustomLink>
			</ul>
		</nav>
	)
}

function CustomLink({ to, children, ...props }) {
	const resolvedPath = useResolvedPath(to)
	const isActive = useMatch({ path: resolvedPath.pathname, end: true })

	return (
		<div className={isActive ? "navbar_item navbar_item_active" : "navbar_item"}>
			<Link className="navbar_link" to={to} {...props}>
				{children}
			</Link>
		</div>
	)
}