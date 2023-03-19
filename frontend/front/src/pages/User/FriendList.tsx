import React, { useState, useContext } from "react";
import ContextDisplayChannel, { LoadUserGlobal } from "../../contexts/DisplayChatContext";
import scroll from 'react-scroll';
import { useEventListenerUserInfo } from "../../useHook/useEventListener";

type typeUserInfo = {
	username: string,
	id: number,
	fl: number | null,
	bl: number | null,
}

const handleClick = (event: React.MouseEvent<HTMLDivElement>,
	userInfo: typeUserInfo,
	setUserInfo: React.Dispatch<React.SetStateAction<typeUserInfo>>,
	setUserId: any, setTop: any): void => {
	event.preventDefault();
	const e: HTMLElement = event.target as HTMLElement;
	const name: string = e.textContent as string;
	//get attributes node
	const attributes: NamedNodeMap = e.attributes as NamedNodeMap;
	const parentNode: HTMLElement = e.parentNode as HTMLElement;

	/* update userInfo state on click, from the html tree */
	if (userInfo.username === "" || userInfo.username != name) {
		setUserId(Number(attributes[0].value));
		if (attributes.length === 4)
			setUserInfo({
				username: name,
				id: Number(attributes[0].value),
				fl: Number(attributes[2].value),
				bl: Number(attributes[3].value)
			});
		else
			setUserInfo({ username: name, id: 0, bl: null, fl: null });
	}
	else {
		setUserId(0);
		setUserInfo({ username: "", id: 0, bl: null, fl: null })
	}
	setTop(parentNode.offsetTop);
}

export default function FriendList(props: { jwt: string }) {
	const { lstUserGlobal, setLstUserGlobal } = useContext(ContextDisplayChannel);
	const [userInfo, setUserInfo] = useState<typeUserInfo>({
		username: "", id: 0, fl: null, bl: null
	});
	const handleListenerClick = () => {
		setUserInfo({ username: "", id: 0, fl: null, bl: null });
	}
	const ref: any = useEventListenerUserInfo(handleListenerClick);
	const Element = scroll.Element;
	let i: number = 0;
	return (<section>
		<h1>FriendList</h1>
		<LoadUserGlobal jwt={props.jwt} />
		<Element name="container" className="element fullBoxListUser" ref={ref}
			/*onClick={(e: React.MouseEvent<HTMLDivElement>) =>
				handleClick(e, userInfo, setUserInfo)}*/>
			{lstUserGlobal &&
				lstUserGlobal.map((usr) => (
					<span data-user-id={usr.id}
						data-friend={(usr.fl == null ? "" : usr.fl)}
						data-block={(usr.bl == null ? "" : usr.bl)}
						key={++i}>{
							"name"
						}</span>
				))
			}
		</Element >
	</section>)

}