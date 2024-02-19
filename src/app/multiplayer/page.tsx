"use client";
import React, { useState } from "react";
import MultiplayerGame from "./components/MultiplayerGameClient.client";
import MultiplayerLobby from "./components/MultiplayerLobby.client";
import "./styles.css";
function MultiplayerPage(props: any) {
  const [gameId, setGameId] = useState<number | null>(null);
  const startGame = (gameId: number) => {
    setGameId(gameId);
  };

  return (
    <div className="h-full w-full flex flex-col align-middle text-center background-image text-white">
      <h1>Multiplayer</h1>
      {gameId ? (
        <MultiplayerGame gameId={gameId} />
      ) : (
        <MultiplayerLobby startGame={startGame} />
      )}
    </div>
  );
}

export default MultiplayerPage;
