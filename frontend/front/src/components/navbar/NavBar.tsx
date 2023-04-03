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
			<ul className="navbar">
				<NavBarLink to="/">Home</NavBarLink>
				<NavBarLink to="/FriendList">FriendList</NavBarLink>
				<NavBarLink to="/BlackList">BlackList</NavBarLink>
				<NavBarLink to="/Setting">Setting</NavBarLink>
				<NavBarLink to="/channels">Channels</NavBarLink>
				<NavBarLink to="/logout">Log Out</NavBarLink>
				<NavBarLink to="/play">Play</NavBarLink>
			</ul>
		</nav>
	)
}

function NavBarLink({ to, children, ...props }) {
	const resolvedPath = useResolvedPath(to);
	const isActive = useMatch({ path: resolvedPath.pathname, end: true });

	return (
		<div className={isActive ? "navbar_item navbar_item_active" : "navbar_item"}>
			<Link className="navbar_link" to={to} {...props}>
				{children}
			</Link>
		</div>
	)
}