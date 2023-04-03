import React from "react";

export interface IGameContext {
  idRoom: number;
  isInRoom: boolean;
  setInRoom: (inRoom: boolean) => void;
  playerSide: 1 | 2;
}

const defaultState: IGameContext = {
  idRoom: 0,
  isInRoom: false,
  setInRoom: () => {},
  playerSide: 1,
};

export default React.createContext(defaultState);
