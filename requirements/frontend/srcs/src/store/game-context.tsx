import React from "react";

export interface IGameContext {
  isInRoom: boolean;
  setInRoom: (inRoom: boolean) => void;
  playerSide: 1 | 2;
}

const defaultState: IGameContext = {
  isInRoom: false,
  setInRoom: () => {},
  playerSide: 1,
};

export default React.createContext(defaultState);
