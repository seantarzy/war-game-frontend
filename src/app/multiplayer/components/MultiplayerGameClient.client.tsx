"use client";
import React, { useState, useEffect, use } from "react";
import { getRandomPlayer } from "../../api/players/methods";
import { env } from "process";
import useGameChannelWebsocket from "../hooks/useGameChannelWebsocket";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Card } from "../types";
import { dealCard } from "@/app/api/multiplayer/methods";
const urlBase = env.NODE_ENV === "production" ? "heroku" : "localhost3001";

function PlayerCard({ player }: { player: Card }) {
  return (
    <div>
      <h2>{player.name}</h2>
      <div>{player.war}</div>
    </div>
  );
}

export default function MultiplayerGame({ gameId }: { gameId: number }) {
  const [currentPlayerSessionId] = useLocalStorage("sessionId", 0);
  const [sessionType] = useLocalStorage("sessionType", null);

  const [cardDrawn, setCardDrawn] = useState<Card | null>(null);

  if (currentPlayerSessionId === 0) {
    console.error("No session id found");
  }
  const drawRando = () => {
    getRandomPlayer().then((card: Card) => {
      console.log("rando player", card);

      setCardDrawn(card);
    });
  };

  const {
    battleReady,
    currentSessionCard,
    oppSessionCard,
    currenSessionScore,
    oppSessionScore,
  } = useGameChannelWebsocket({
    gameId: gameId,
    currentPlayerSessionId: currentPlayerSessionId,
    sessionType: sessionType,
  });

  const sendMove = () => {
    if (!cardDrawn) {
      console.error("No card drawn");
      return;
    }
    const playerId = parseInt(cardDrawn.id);

    dealCard(gameId, currentPlayerSessionId, playerId).then((res) => {
      console.log("card dealt", res);
    });
  };

  useEffect(() => {
    if (battleReady) {
      console.log("Battle ready");
    }
  }, [battleReady]);

  return (
    <div>
      <h1>MultiplayerGame</h1>
      <div>Your score: {currenSessionScore}</div>
      <div>Opponenet score: {oppSessionScore}</div>

      <div>{cardDrawn ? <div>{cardDrawn.name}</div> : null}</div>
      <button onClick={drawRando} className="rounded-md">
        {cardDrawn ? "Redraw" : "Get Random Player"}
      </button>
      <button onClick={sendMove} className="rounded-md">
        Send Move
      </button>
      {battleReady ? (
        <div>
          <h1>Battle Ready</h1>
          <div>
            <h2>Yours</h2>

            <div>
              {currentSessionCard ? (
                <PlayerCard player={currentSessionCard} />
              ) : null}
            </div>
          </div>
          <div>
            <h2>Your opponent</h2>
            <div>
              {oppSessionCard ? <PlayerCard player={oppSessionCard} /> : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
