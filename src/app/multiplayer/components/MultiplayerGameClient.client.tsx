"use client";
import React, { useState, useEffect, use, useMemo } from "react";
import { getRandomPlayer } from "../../api/players/methods";
import { env } from "process";
import useGameChannelWebsocket from "../hooks/useGameChannelWebsocket";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Card } from "../types";
import { dealCard } from "@/app/api/multiplayer/methods";
import CardBackImage from "../../assets/war-games-back.jpeg";
import Image from "next/image";

const urlBase = env.NODE_ENV === "production" ? "heroku" : "localhost3001";

const cardSlideTimeDuration: number = 1000;

function BaseCardLayout({ children }: { children: React.ReactNode }) {
  return <div className="h-56 w-40">{children}</div>;
}
function PlayerCard({ player }: { player: Card }) {
  return (
    <BaseCardLayout>
      <div className="bg-blue-600 border-gray-100 border-2 h-full w-full flex flex-col justify-center items-center">
        <h2>{player.name}</h2>
        <img src={player.image} alt={player.name} className="w-[90%] h-[80%]" />
        <div>WAR: {player.war}</div>
      </div>
    </BaseCardLayout>
  );
}

function CardBack() {
  return (
    <BaseCardLayout>
      <Image className="h-full w-full" src={CardBackImage} alt="card back" />
    </BaseCardLayout>
  );
}

const BaseballIcon = ({ className }: { className: string }) => (
  <svg
    id="bat"
    width="100"
    height="43"
    viewBox="0 0 337.4 42.6"
    className={className}
  >
    <path
      className="tan"
      d="M95.2 12.7c-36.4 1.4-74.9-0.2-85-0.7C8.9 7.1 6 7.3 6 7.3s-6 1-6 13.8 4.7 14.8 6.5 14.8c2.5 0 3.4-4.2 3.6-5.2 10.1-0.5 48.6-2.1 85-0.7 15.5 0.6 42.9 2 72 3.6V9.1C138 10.7 110.6 12.1 95.2 12.7z"
    />
    <path
      className="tan"
      d="M323 0.1c0 0-33.5 1.7-43.1 2.5 -5.3 0.5-47.8 3-92 5.4v26.6c44.2 2.4 86.7 4.9 92 5.4 9.6 0.8 43.1 2.5 43.1 2.5s14.4 2.5 14.4-21v-0.4C337.4-2.4 323 0.1 323 0.1z"
    />
    <path
      className="red"
      d="M167.1 9.1v24.3c6.9 0.4 13.8 0.7 20.8 1.1V8C181 8.4 174 8.7 167.1 9.1z"
    />
  </svg>
);

function BaseballButton({
  onClick,
  disabled,
  children,
}: {
  onClick: any;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${
        disabled ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-700"
      } transition duration-150 ease-in-out`}
    >
      <BaseballIcon className="mr-4" />
      {children}
    </button>
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

  function MySide() {
    function MyButtonSet() {
      return (
        <div className="flex flex-col gap-4">
          <BaseballButton onClick={drawRando} disabled={false}>
            {cardDrawn ? "Redraw" : "Draw Player"}
          </BaseballButton>
          <BaseballButton onClick={sendMove} disabled={!cardDrawn}>
            Send Move
          </BaseballButton>
        </div>
      );
    }

    return (
      <div className="flex m-5 gap-4 self-end">
        <MyButtonSet />
        {cardDrawn ? <PlayerCard player={cardDrawn} /> : <CardBack />}
        <div>
          {currentSessionCard && !currentCardInMiddle ? (
            <h2>Your card is sending...</h2>
          ) : null}
          {/* {currentSessionCard && currentCardInMiddle ? (
            <div>
              <h2>Your card in the middle:</h2>
              <PlayerCard player={currentSessionCard} />
            </div>
          ) : null} */}
        </div>
      </div>
    );
  }

  function TheirSide() {
    return (
      <div className="flex flex-col m-5">
        <div>
          <h2>Opponent's side</h2>
        </div>

        {!oppSessionCard ? (
          <CardBack />
        ) : oppSessionCard && !oppCardInMiddle ? (
          <h2>Opponent's card is sending...</h2>
        ) : null}
        {oppSessionCard && oppCardInMiddle ? (
          <div>
            <h2>Opponent's card in the middle:</h2>
            <PlayerCard player={oppSessionCard} />
          </div>
        ) : null}
      </div>
    );
  }

  function ScoreBoard() {
    return (
      <div className="bg-black rounded text-lg justify-center w-1/2">
        <div>Your score: {currentSessionScore}</div>
        <div>Opponent score: {oppSessionScore}</div>
      </div>
    );
  }

  function BattleField() {
    return (
      <div>
        {battleReady ? (
          <div>
            <h2>Battle!</h2>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex align-middle justify-center">
        <ScoreBoard />
      </div>
      <div className="flex flex-col align-middle justify-between h-full">
        <div className="self-start">
          <TheirSide />
        </div>
        {/* battle field */}
        <BattleField />
        <div>
          {battleReady ? (
            <div>
              <h2>Battle!</h2>
            </div>
          ) : null}
        </div>
        <div className="self-end">
          <MySide />
        </div>
      </div>
    </div>
  );
}
