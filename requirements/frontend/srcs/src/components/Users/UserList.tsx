import UserItem from './UserItem';

function UserList(props: any) {
    return <ul> 
        {props.items.map((item: any) => <UserItem key={item.id} id={item.id} />)}
    </ul>
}

export default UserList;