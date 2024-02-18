"use client";
import React, { useState, useEffect, use, useMemo } from "react";
import { getRandomPlayer } from "../../api/players/methods";
import { env } from "process";
import useGameChannelWebsocket from "../hooks/useGameChannelWebsocket";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Card } from "../types";
import { dealCard } from "@/app/api/multiplayer/methods";
const urlBase = env.NODE_ENV === "production" ? "heroku" : "localhost3001";

const cardSlideTimeDuration: number = 1000;

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
  const {
    currentSessionCard,
    oppSessionCard,
    currenSessionScore,
    oppSessionScore,
    invalidateCardRound,
  } = useGameChannelWebsocket({
    gameId: gameId,
    currentPlayerSessionId: currentPlayerSessionId,
    sessionType: sessionType,
  });
  const drawRando = () => {
    getRandomPlayer().then((card: Card) => {
      console.log("rando player", card);

      setCardDrawn(card);
    });
  };
  let battleReady = !!currentSessionCard && !!oppSessionCard;
  if (currentPlayerSessionId === 0) {
    console.error("No session id found");
  }

  const sendMove = () => {
    if (!cardDrawn) {
      animateCardSlide();
      return;
    }
    const playerId = parseInt(cardDrawn.id);

    dealCard(gameId, currentPlayerSessionId, playerId).then((res) => {
      console.log("card dealt", res);
    });
  };

  useEffect(() => {
    if (battleReady) {
      console.log("battle ready");
      animateCardSlide();
    }
  }, [battleReady]);

  function animateCardSlide() {
    let tomeoutId;
    let secondTimeoutId;
    tomeoutId = setTimeout(() => {
      console.log("card slide");
      secondTimeoutId = setTimeout(() => {
        console.log("done");
        invalidateCardRound();
        setCardDrawn(null);
      }, 300);
    }, cardSlideTimeDuration);

    // clearTimeout(tomeoutId);
  }

  return (
    <div>
      <h1>MultiplayerGame</h1>
      <div>Your score: {currenSessionScore}</div>
      <div>Opponenet score: {oppSessionScore}</div>

      <div>{cardDrawn ? <div>{cardDrawn.name}</div> : null}</div>
      <button onClick={drawRando} className="rounded-md">
        {cardDrawn ? "Redraw" : "Draw Player"}
      </button>
      <button onClick={sendMove} className="rounded-md">
        Send Move
      </button>
      {currentSessionCard ? (
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
