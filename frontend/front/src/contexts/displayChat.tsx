import React from 'react';

type contextDisplay = {
    renderDirectMessage: boolean,
    userId: number,
    setDisplay: React.Dispatch<React.SetStateAction<boolean> >,
    setUserId: React.Dispatch<React.SetStateAction<number> >
}

const defaultValue = () => { }

const ContextDisplayChannel = React.createContext<contextDisplay>({
    renderDirectMessage: false,
    userId: 0,
    setDisplay: defaultValue,
    setUserId: defaultValue
});

export default ContextDisplayChannel;