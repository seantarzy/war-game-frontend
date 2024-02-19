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

  const [currentCardInMiddle, setcurrentCardInMiddle] = useState(false);
  const [oppCardInMiddle, setOppCardInMiddle] = useState(false);

  const [cardDrawn, setCardDrawn] = useState<Card | null>(null);
  const {
    currentSessionCard,
    oppSessionCard,
    currentSessionScore,
    oppSessionScore,
    invalidateCardRound,
  } = useGameChannelWebsocket({
    gameId: gameId,
    currentPlayerSessionId: currentPlayerSessionId,
    sessionType: sessionType,
  });
  const drawRando = () => {
    getRandomPlayer().then((card: Card) => {
      setCardDrawn(card);
    });
  };

  let opponentReady = !!oppSessionCard;

  let currentReady = !!currentSessionCard;

  let battleReady = !!currentSessionCard && !!oppSessionCard;

  console.log("battle ready", battleReady);
  if (currentPlayerSessionId === 0) {
    console.error("No session id found");
  }

  const sendMove = () => {
    if (!cardDrawn) {
      return;
    }
    const playerId = parseInt(cardDrawn.id);

    dealCard(gameId, currentPlayerSessionId, playerId).then((res) => {
      console.log("card dealt", res);
    });
  };

  useEffect(() => {
    if (opponentReady) {
      setTimeout(() => {
        setOppCardInMiddle(true);
      }, cardSlideTimeDuration);
    }
  }, [opponentReady]);

  useEffect(() => {
    if (currentReady) {
      setTimeout(() => {
        setcurrentCardInMiddle(true);
      }, cardSlideTimeDuration);
    }
  }, [currentReady]);

  useEffect(() => {
    if (battleReady) {
      let tomeoutId;
      let secondTimeoutId;
      tomeoutId = setTimeout(() => {
        console.log("card slide");
        secondTimeoutId = setTimeout(() => {
          console.log("done");
          setOppCardInMiddle(false);
          setcurrentCardInMiddle(false);
          invalidateCardRound();
          setCardDrawn(null);
        }, 1000);
      }, cardSlideTimeDuration);
    }
  }, [battleReady]);

  // function animateCardSlide() {
  //   let tomeoutId;
  //   let secondTimeoutId;
  //   tomeoutId = setTimeout(() => {
  //     console.log("card slide");
  //     secondTimeoutId = setTimeout(() => {
  //       console.log("done");
  //       invalidateCardRound();
  //       setCardDrawn(null);
  //     }, 300);
  //   }, cardSlideTimeDuration);

  //   // clearTimeout(tomeoutId);
  // }

  return (
    <div>
      <h1>MultiplayerGame</h1>
      <div>Your score: {currentSessionScore}</div>
      <div>Opponent score: {oppSessionScore}</div>

      <div>
        {cardDrawn ? (
          <div>{cardDrawn.name}</div>
        ) : (
          <button onClick={drawRando} className="rounded-md">
            {cardDrawn ? "Redraw" : "Draw Player"}
          </button>
        )}
      </div>

      {cardDrawn ? (
        <button onClick={sendMove} className="rounded-md" disabled={!cardDrawn}>
          Send Move
        </button>
      ) : null}

      {/* Your side */}
      <div>
        {currentSessionCard && !currentCardInMiddle ? (
          <h2>Your card is sending...</h2>
        ) : null}
        {currentSessionCard && currentCardInMiddle ? (
          <div>
            <h2>Your card in the middle:</h2>
            <PlayerCard player={currentSessionCard} />
          </div>
        ) : null}
      </div>

      {/* Opponent's side */}
      <div>
        {oppSessionCard && !oppCardInMiddle ? (
          <h2>Opponent's card is sending...</h2>
        ) : null}
        {oppSessionCard && oppCardInMiddle ? (
          <div>
            <h2>Opponent's card in the middle:</h2>
            <PlayerCard player={oppSessionCard} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
