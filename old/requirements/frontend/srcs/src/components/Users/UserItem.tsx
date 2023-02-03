type ItemProps = {
    userID: number,
    username: string,
    // email: string,
    // password: string,
}

function UserItem(props: ItemProps) {
    return <li>
        <div>
            <h3>{props.userID}</h3>
            <h3>{props.username}</h3>
            {/* <h3>{props.email}</h3>
            <h3>{props.password}</h3> */}
        </div>
    </li>
}

export default UserItem;