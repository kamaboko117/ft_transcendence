import React, { useEffect, useRef, useState, useContext } from 'react';
import { useLocation, useParams } from 'react-router-dom';


/* useLocation recover values from url
	useParams will get parameters id from url
*/
const UserProfileOther = (props: {jwt: string}) => {
	const getLocation = useLocation();
    const id = useParams().id as string;
	console.log(id)
	if (isNaN(Number(id)))
		return (<span>Wrong type id</span>)
	return (<></>);
}

export default UserProfileOther;