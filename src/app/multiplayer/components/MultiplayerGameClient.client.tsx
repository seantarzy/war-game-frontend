"use client";
import React, { useState, useEffect, use } from "react";
import { getRandomPlayer } from "../../api/players";
import { env } from "process";
import useGameChannelWebsocket from "../hooks/useGameChannelWebsocket";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Card } from "../types";
import { dealCard } from "@/app/api/multiplayer";
const urlBase = env.NODE_ENV === "production" ? "heroku" : "localhost3001";
export default function MultiplayerGame({ gameId }: { gameId: number }) {
  const [currentPlayerSessionId] = useLocalStorage("sessionId", 0);
  const [sessionType] = useLocalStorage("sessionType", null);

  const [cardDrawn, setCardDrawn] = useState<Card | null>(null);

  if (currentPlayerSessionId === 0) {
    console.error("No session id found");
  }
  const drawRando = () => {
    getRandomPlayer().then((res) => {
      console.log(res);
      setCardDrawn(res.card);
    });
  };

  const { battleReady, currentSessionCard, oppSessionCard } =
    useGameChannelWebsocket({
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
      console.log(res);
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
      <button onClick={drawRando} className="rounded-md">
        Get Random Player
      </button>
      <button onClick={sendMove} className="rounded-md">
        Send Move
      </button>
    </div>
  );
}
