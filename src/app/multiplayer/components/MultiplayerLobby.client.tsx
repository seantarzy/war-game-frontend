"use client";
import { createGame, joinGame } from "@/app/api/multiplayer/methods";
import React, { FormEvent, use, useEffect, useState } from "react";
import useGameChannelWebsocket from "../hooks/useGameChannelWebsocket";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { sessionType } from "../types";
import { destroyGame } from "@/app/api/game/methods";
import { BaseballButton } from "./ui_components/Button";

export default function MultiplayerLobby({
  startGame,
}: {
  startGame: (gameId: number) => void;
}) {
  const [clickedJoin, setClickedJoin] = useState(false);
  const [gameCode, setGameCode] = useLocalStorage("gameCode", "");
  const [gameId, setGameId] = useLocalStorage<number | null>("gameId", null);
  const [sessionId, setSessionId] = useLocalStorage("sessionId", 0);
  const [sessionType, setSessionType] = useLocalStorage<sessionType | null>(
    "sessionType",
    null
  );

  const { gameStarted, gameReady, exitLobby } = useGameChannelWebsocket({
    currentPlayerSessionId: sessionId,
    gameId: gameId,
    sessionType: sessionType,
  });

  useEffect(() => {
    if (gameId && gameReady) {
      startGame(gameId);
    }
  }, [gameReady]);

  const handleGameCreate = () => {
    // create a new game
    // subscribe to the game channel
    createGame().then((res) => {
      setGameId(res.game.id);
      setGameCode(res.game.invite_code);
      setSessionId(res.session.id);
      setSessionType("host");
    });
  };

  const handleJoinGame = (event: FormEvent) => {
    event.preventDefault();
    joinGame(gameCode).then((res) => {
      setGameId(res.game.id);
      setSessionId(res.session.id);
      setSessionType("guest");
    });
    // join an existing game
    // subscribe to the game channel
  };

  function InitialLobby() {
    return (
      <div className="flex flex-col items-center justify-center">
        {
          // if the user clicks join game
          // we show a form to enter the game code
          clickedJoin ? (
            <form onSubmit={(e) => handleJoinGame(e)}>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Enter game code"
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                />
                <BaseballButton disabled={false} type="submit" className="h-14">
                  Join Game
                </BaseballButton>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-4 w-1/3 items-center justify-center self-center">
              <BaseballButton
                onClick={handleGameCreate}
                disabled={false}
                className="w-72"
              >
                Create Game
              </BaseballButton>
              <BaseballButton
                disabled={false}
                onClick={() => setClickedJoin(true)}
                className="w-72"
              >
                Join Game
              </BaseballButton>
            </div>
          )
        }
      </div>
    );
  }

  const endGame = () => {
    if (!gameId) return;
    setGameCode("");
    setSessionType(null);
    exitLobby();
    destroyGame(gameId);
    window.localStorage.removeItem("gameCode");
  };

  function WaitingLobby() {
    return (
      <div className="flex flex-col gap-4 items-center justify-center">
        <BaseballButton onClick={endGame} disabled={false} className="w-48">
          Back
        </BaseballButton>
        <div className="bg-slate-700 rounded-lg py-6 px-12">
          <h1>Game Started! Send this invite code to your friend:</h1>
          <h2>{gameCode}</h2>
        </div>
      </div>
    );
  }

  return (
    <div>
      {gameStarted && sessionType == "host" ? <WaitingLobby /> : InitialLobby()}
    </div>
  );
}
