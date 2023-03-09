import React from 'react';

type contextDisplay = {
    renderDirectMessage: boolean,
    userId: number,
    id: string,
    setDisplay: React.Dispatch<React.SetStateAction<boolean>>,
    setUserId: React.Dispatch<React.SetStateAction<number>>
    setId: React.Dispatch<React.SetStateAction<string>>
}

const defaultValue = () => { }

const ContextDisplayChannel = React.createContext<contextDisplay>({
    renderDirectMessage: false,
    userId: 0,
    id: "",
    setDisplay: defaultValue,
    setUserId: defaultValue,
    setId: defaultValue
});

export default ContextDisplayChannel;