import UserItem from "./UserItem";

function UserList(props: any) {
    return (
        <ul>
            {props.users.map((item: any) => (
                <UserItem
                    key={item.id}
                    id={item.id}
                    username={item.username}
                    email={item.email}
                    password={item.password}
                />
            ))}
        </ul>
    );
}

export default UserList;
