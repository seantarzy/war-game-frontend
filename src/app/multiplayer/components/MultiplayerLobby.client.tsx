"use client";
import { createGame, joinGame } from "@/app/api/multiplayer/methods";
import React, { FormEvent, use, useEffect, useState } from "react";
import useGameChannelWebsocket from "../hooks/useGameChannelWebsocket";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { sessionType } from "../types";
import { destroyGame } from "@/app/api/game/methods";

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
      <div>
        <h1>Multiplayer Lobby</h1>
        <button onClick={handleGameCreate}>create game</button>
        <button onClick={() => setClickedJoin(true)}>join game</button>
        {
          // if the user clicks join game
          // we show a form to enter the game code
          clickedJoin && (
            <form onSubmit={(e) => handleJoinGame(e)}>
              <input
                type="text"
                placeholder="Enter game code"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value)}
              />
              <button type="submit">Join Game</button>
            </form>
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
      <div>
        <button onClick={endGame}>Back</button>
        <h1>Game Started! Send this invite code to your friend:</h1>
        <h2>{gameCode}</h2>
      </div>
    );
  }

  return (
    <div>
      {gameStarted && sessionType == "host" ? (
        <WaitingLobby />
      ) : (
        <InitialLobby />
      )}
    </div>
  );
}
