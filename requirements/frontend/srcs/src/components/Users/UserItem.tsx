type ItemProps = {
    id: string,
    username: string,
    email: string,
    password: string,
}

function UserItem(props: ItemProps) {
    return <li>
        <div>
            <h3>{props.id}</h3>
            <h3>{props.username}</h3>
            <h3>{props.email}</h3>
            <h3>{props.password}</h3>
        </div>
    </li>
}

export default UserItem;