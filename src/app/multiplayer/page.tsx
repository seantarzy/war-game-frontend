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
    <div className="h-full w-full flex flex-col text-center background-image text-white  ">
      <div className="bg-slate-300 text-black rounded-lg px-16 py-4">
        <h1>Multiplayer</h1>
      </div>
      <br />
      <br />
      <div className="flex flex-col justify-center">
        <div className="flex flex-col align-middle justify-center">
          {gameId ? (
            <MultiplayerGame gameId={gameId} />
          ) : (
            <MultiplayerLobby startGame={startGame} />
          )}
        </div>
      </div>
    </div>
  );
}

export default MultiplayerPage;
