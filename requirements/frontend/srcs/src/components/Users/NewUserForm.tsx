import { useRef } from "react";

function NewUserForm(props: any) {
    const usernameInputRef = useRef<HTMLInputElement>(null);

    function submitHandler(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const username = usernameInputRef.current!.value;
        props.onAddUser(username);
    }

    return (
        <div>
            <form onSubmit={submitHandler}>
                <h1>Create new user</h1>
                <input
                    type="text"
                    placeholder="username"
                    ref={usernameInputRef}
                />
                <div>
                    <button>Create</button>
                </div>
            </form>
        </div>
    );
}

export default NewUserForm;
