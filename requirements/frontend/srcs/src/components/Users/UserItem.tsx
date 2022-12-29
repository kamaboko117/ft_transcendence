type ItemProps = {
    id: string,
}

function MeetupItem(props: ItemProps) {
    return <li>
        <div>
            <h3>{props.id}</h3>
        </div>
    </li>
}

export default MeetupItem;