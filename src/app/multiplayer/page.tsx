"use client";
import React, { useState } from "react";
import MultiplayerGame from "./components/MultiplayerGameClient.client";
import MultiplayerLobby from "./components/MultiplayerLobby.client";

function MultiplayerPage(props: any) {
  const [gameId, setGameId] = useState<number | null>(null);
  const startGame = (gameId: number) => {
    setGameId(gameId);
  };
  return (
    <div className="h-full w-full">
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
