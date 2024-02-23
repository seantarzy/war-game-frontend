"use client";
import React, { useState, useEffect, use, useMemo, useRef, memo } from "react";
import { getRandomPlayer } from "../../api/players/methods";
import { env } from "process";
import useGameChannelWebsocket from "../hooks/useGameChannelWebsocket";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Card } from "../types";
import { dealCard } from "@/app/api/multiplayer/methods";
import { useSpring, animated } from "@react-spring/web";
import { BaseballButton } from "./ui_components/Button";
import { CardBack, PlayerCard, CardStack } from "./ui_components/Deck";

const urlBase = env.NODE_ENV === "production" ? "heroku" : "localhost3001";

const CARD_SLIDE_TIME_DURATION: number = 1000;

const CARD_BATTLE_TIME_DURATION: number = 3000;

type XYPos = { x: number; y: number };
export default function MultiplayerGame({ gameId }: { gameId: number }) {
  const [currentPlayerSessionId] = useLocalStorage("sessionId", 0);
  const [sessionType] = useLocalStorage("sessionType", null);

  const [cardSlideReady, setcardSlideReady] = useState(false);
  const [oppCardInMiddle, setOppCardInMiddle] = useState(false);
  const [currentCardInMiddle, setCurrentCardInMiddle] = useState(false);
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

  // state variables for holding scores when we're ready to show them
  const [readyCurrentScore, setReadyCurrentScore] = useState<number | null>(
    currentSessionScore
  );
  const [readyOppScore, setReadyOppScore] = useState<number | null>(
    oppSessionScore
  );
  const drawRando = () => {
    getRandomPlayer().then((card: Card) => {
      setCardDrawn(card);
    });
  };

  const [oppFlipped, setOppFlipped] = useState(true);

  let opponentReady = !!oppSessionCard;
  let currentReady = !!currentSessionCard;
  let battleReady =
    !!currentSessionCard &&
    !!oppSessionCard &&
    !!oppCardInMiddle &&
    !!currentCardInMiddle;

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
      // setTimeout(() => {
      //   handleCurrentSlideDone();
      // }, CARD_BATTLE_TIME_DURATION);
    });
  };

  useEffect(() => {
    if (currentSessionScore && battleReady) {
      setReadyCurrentScore(currentSessionScore);
    }
  }, [currentSessionScore, battleReady]);

  useEffect(() => {
    if (oppSessionScore && battleReady) {
      setReadyOppScore(oppSessionScore);
    }
  }, [oppSessionScore, battleReady]);

  useEffect(() => {
    if (opponentReady) {
      setTimeout(() => {
        setOppCardInMiddle(true);
      }, CARD_SLIDE_TIME_DURATION);
    }
  }, [opponentReady]);

  useEffect(() => {
    if (currentReady) {
      setTimeout(() => {
        setCurrentCardInMiddle(true);
      }, CARD_SLIDE_TIME_DURATION);
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
          setcardSlideReady(false);
          invalidateCardRound();
          setCardDrawn(null);
          setCurrentCardInMiddle(false);
          setOppFlipped(true);
        }, 1000);
      }, CARD_SLIDE_TIME_DURATION);
    }
  }, [battleReady]);

  const currentSlideIn = useSpring({
    to: {
      transform: cardSlideReady
        ? "translate(-30vw, -21vh)" // Moves the card to the center of the screen
        : "translate(0vw, 0vh)", // Returns the card to its original position
    },
    from: { transform: "translate(0vw, 0vh)" },
    config: { duration: CARD_SLIDE_TIME_DURATION },
  });

  const opponentSlideIn = useSpring({
    to: {
      transform: oppSessionCard
        ? "translate(30vw, 12vh)" // Moves the card to the center for the animation
        : "translate(0vw, 0vh)", // Returns the card to its original position once the animation is done
    },
    from: { transform: "translate(0vw, 0vh)" },
    config: { duration: CARD_SLIDE_TIME_DURATION },
    // Only start the animation if the opponent's card is being sent (oppCardInMiddle is true) and the battle isn't ready
    reset: !oppCardInMiddle,
  });

  const MySide = memo(() => {
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
      <div className="flex m-5 gap-8 self-end">
        {!currentSessionCard && <MyButtonSet />}
        {cardDrawn ? (
          <animated.div style={currentSlideIn}>
            <PlayerCard player={cardDrawn} side="current" flipped={false} />
          </animated.div>
        ) : (
          <div className="relative">
            <div className="absolute z-1000">
              <CardBack />
            </div>
            <CardStack fromDirection="right" />
          </div>
        )}
      </div>
    );
  });

  useEffect(() => {
    if (oppSessionCard && oppCardInMiddle && battleReady) {
      setOppFlipped(false);
    }
  }, [oppSessionCard, oppCardInMiddle, battleReady]);

  const TheirSide = memo(() => {
    return (
      <div className="flex flex-col m-5">
        <div>
          <h2>Opponent's side</h2>
        </div>

        {!oppSessionCard ? (
          // not even ready yet, maybe has drawn a card at most
          <CardStack fromDirection="left" />
        ) : (
          <animated.div style={opponentSlideIn}>
            <PlayerCard
              player={oppSessionCard}
              side="opponent"
              flipped={oppFlipped}
            />
          </animated.div>
        )}
      </div>
    );
  });

  function ScoreBoard() {
    return (
      <div className="bg-black rounded text-lg justify-center w-1/2">
        <div>Your score: {readyCurrentScore}</div>
        <div>Opponent score: {readyOppScore}</div>
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
    <div className="flex flex-col h-full flex-1">
      <div className="flex align-top items-start justify-center">
        <ScoreBoard />
      </div>
      <div className="flex flex-col align-middle justify-between h-full">
        <div className="self-start ml-6">
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
        <div className="self-end fixed bottom-0">
          <MySide />
        </div>
      </div>
    </div>
  );
}
