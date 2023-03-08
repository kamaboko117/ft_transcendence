import React from "react";

export interface IGameContext {
  isInRoom: boolean;
  setInRoom: (inRoom: boolean) => void;
}

const defaultState: IGameContext = {
  isInRoom: false,
  setInRoom: () => {},
};

export default React.createContext(defaultState);
