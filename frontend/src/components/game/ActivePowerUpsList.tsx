import React from "react";
import ActivePowerUpItem from "./ActivePowerUpItem";

export default function ActivePowerUpsList(props: {
  powerUps: any[];
  side: number;
}) {
  function generateRandomkey() {
    return Math.random().toString(36).substring(7);
  }
  let player = props.side === 1 ? "player1" : "player2";
  let ActivePowerUps = props.powerUps.filter((powerUp) => powerUp.active);
  let alliedPowerUps = ActivePowerUps.filter(
    (powerUp) => powerUp.user === player
  );
  let enemyPowerUps = ActivePowerUps.filter(
    (powerUp) => powerUp.user !== player
  );
  return (
    <div className="game_powerups_container">
      <div className="game_powerups_container_text">Active Power Ups</div>
      <div>
        Yours
        <div className="game_powerups_list">
          {alliedPowerUps.map((powerUp) => (
            <ActivePowerUpItem key={generateRandomkey()} powerUp={powerUp} />
          ))}
        </div>
        Theirs
        <div className="game_powerups_list">
          {enemyPowerUps.map((powerUp) => (
            <ActivePowerUpItem key={generateRandomkey()} powerUp={powerUp} />
          ))}
        </div>
      </div>
    </div>
  );
}
