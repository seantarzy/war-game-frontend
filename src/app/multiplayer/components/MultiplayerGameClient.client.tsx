"use client";
import React, { useState, useEffect, use, useMemo, useRef } from "react";
import { getRandomPlayer } from "../../api/players/methods";
import { env } from "process";
import useGameChannelWebsocket from "../hooks/useGameChannelWebsocket";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Card } from "../types";
import { dealCard } from "@/app/api/multiplayer/methods";
import CardBackImage from "../../assets/war-games-back.jpeg";
import Image from "next/image";
import { useSpring, animated } from "@react-spring/web";
import { BaseballButton } from "./ui_components/Button";

const urlBase = env.NODE_ENV === "production" ? "heroku" : "localhost3001";

const CARD_SLIDE_TIME_DURATION: number = 1000;

const CARD_BATTLE_TIME_DURATION: number = 3000;

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

type XYPos = { x: number; y: number };
export default function MultiplayerGame({ gameId }: { gameId: number }) {
  const [currentPlayerSessionId] = useLocalStorage("sessionId", 0);
  const [sessionType] = useLocalStorage("sessionType", null);

  const [cardSlideReady, setcardSlideReady] = useState(false);
  const [oppCardInMiddle, setOppCardInMiddle] = useState(false);

  const currentCardRef = useRef<HTMLDivElement>(null);
  const [currentPosition, setCurrentPosition] = useState<XYPos>({ x: 0, y: 0 });

  const [props, set] = useSpring(() => ({
    to: {
      transform: `translate(${currentPosition.x}px, ${currentPosition.y}px)`,
    },
    from: {
      transform: `translate(${currentPosition.x}px, ${currentPosition.y}px)`,
    },
    config: { tension: 170, friction: 26 },
  }));

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

  const [springs, api] = useSpring(() => ({}));

  let opponentReady = !!oppSessionCard;

  let currentReady = !!currentSessionCard;

  let battleReady = !!currentSessionCard && !!oppSessionCard;

  if (currentPlayerSessionId === 0) {
    console.error("No session id found");
  }

  const sendMove = () => {
    if (!cardDrawn) {
      return;
    }

    const playerId = parseInt(cardDrawn.id);

    dealCard(gameId, currentPlayerSessionId, playerId).then((res) => {
      setcardSlideReady(true);
      setTimeout(() => {
        handleCurrentSlideDone();
      }, CARD_BATTLE_TIME_DURATION);
    });
  };

  useEffect(() => {
    if (opponentReady) {
      setTimeout(() => {
        setOppCardInMiddle(true);
      }, CARD_SLIDE_TIME_DURATION);
    }
  }, [opponentReady]);

  useEffect(() => {
    if (battleReady) {
      let tomeoutId;
      let secondTimeoutId;
      tomeoutId = setTimeout(() => {
        console.log("card slide");
        secondTimeoutId = setTimeout(() => {
          console.log("done");
          setOppCardInMiddle(false);
          setcardSlideReady(false);
          invalidateCardRound();
          setCardDrawn(null);
        }, 1000);
      }, CARD_SLIDE_TIME_DURATION);
    }
  }, [battleReady]);

  const handleCurrentSlideDone = () => {
    setTimeout(() => {
      setOppCardInMiddle(false);
      setcardSlideReady(false);
      invalidateCardRound();
      setCardDrawn(null);
    }, 1000);
  };

  const slideIn = useSpring({
    to: {
      transform: cardSlideReady
        ? "translate(-40vw, -20vh)" // Moves the card to the center of the screen
        : "translate(0vw, 0vh)", // Returns the card to its original position
    },
    from: { transform: "translate(0vw, 0vh)" },
    config: { duration: CARD_SLIDE_TIME_DURATION },
  });
  function MySide() {
    function MyButtonSet() {
      return (
        <div className="flex flex-col gap-4 self-center">
          <BaseballButton
            onClick={drawRando}
            disabled={false}
            className="h-14 w-42"
          >
            {cardDrawn ? "Redraw" : "Draw Player"}
          </BaseballButton>
          <BaseballButton
            onClick={sendMove}
            disabled={!cardDrawn}
            className="h-14 w-42"
          >
            Send Move
          </BaseballButton>
        </div>
      );
    }

    return (
      <div className="flex m-5 gap-4 self-end">
        <MyButtonSet />
        {cardDrawn ? (
          <animated.div style={slideIn}>
            <PlayerCard player={cardDrawn} />
          </animated.div>
        ) : (
          <CardBack />
        )}
        <div>
          {/* {currentSessionCard && cardSlideReady ? (
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
