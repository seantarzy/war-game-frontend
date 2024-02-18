import { hostInGame, guestInGame } from "@/app/api/multiplayer/methods";
import { useEffect, useState } from "react";
import { Card, sessionType } from "../types";
import { useLocalStorage } from "./useLocalStorage";

const useGameChannelWebsocket = ({
  currentPlayerSessionId,
  gameId,
  sessionType,
}: {
  currentPlayerSessionId: number;
  gameId: number | null;
  sessionType: sessionType | null;
}): {
  websocket: WebSocket | null;
  gameReady: boolean;
  gameStarted: boolean;
  battleReady: boolean;
  currentSessionCard: Card | null;
  oppSessionCard: Card | null;
  currenSessionScore: number;
  oppSessionScore: number;
  invalidateCardRound: () => void;
  exitLobby: () => void;
} => {
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const [gameReady, setGameReady] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentSessionCard, setCurrentSessionCard] = useState<Card | null>(
    null
  );

  const [currenSessionScore, setCurrentSessionScore] = useLocalStorage(
    "currentSessionScore",
    0
  );
  const [oppSessionScore, setOppSessionScore] = useLocalStorage(
    "oppSessionScore",
    0
  );

  const [roundWinner, setRoundWinner] = useState<boolean | "tie" | null>(null);

  const [oppSessionCard, setOppSessionCard] = useState<Card | null>(null);

  const battleReady = currentSessionCard && oppSessionCard ? true : false;

  const handleCardPlayed = (message: any) => {
    // when we know it's the current session that played, we animate current sessions card sliding face up to the center
    // when we know it's the opp session that played, we animate opp sessions card sliding face down to the center
    // at the end of the animation,
    // if it was the current session's animation that just finished, we flip the opp session card face up
    // if it was the opp session's animation that just finished, we flip the opp session card face up
    // either way, it's the opp session's card that flips over, when both cards are ready.

    // so:
    //   animate to center in both cases
    //      - if current session, send the card face up
    //      - if opp session, send the card face down
    //   if both cards are ready, flip the opp session card face up
    //       - if both cards are ready, backend should tell us who won
    //       - but we dont reveal right away, we wait for the animation to finish
    //  then we reveal
    //    - the opponent's card
    //    - the winner
    //    - the score
    if (message.session.id === currentPlayerSessionId) {
      console.log("Setting current session card: ", message.player);
      setCurrentSessionCard(message.player);
    } else {
      console.log("Setting opp session card: ", message.player);
      setOppSessionCard(message.player);
    }
  };

  const invalidateCardRound = () => {
    setCurrentSessionCard(null);
    setOppSessionCard(null);
  };

  const handleRoundWinner = (message: any) => {
    const winner = message.winner;
    const loser = message.loser;
    if (winner === "tie") {
      setRoundWinner("tie");
      console.log("It's a tie");
    }
    switch (winner.id) {
      case currentPlayerSessionId:
        setRoundWinner(true);
        setCurrentSessionScore(winner.current_score);
        break;
      default:
        setOppSessionScore(winner.current_score);
        setRoundWinner(false);
        console.log("You lost the round");
    }
  };

  function exitLobby() {
    setGameReady(false);
  }

  useEffect(() => {
    let ws: WebSocket;

    if (gameId) {
      ws = new WebSocket(`ws://localhost:3001/cable`);
      ws.onopen = () => {
        console.log("Connected to WebSocket");
        const subscription = {
          command: "subscribe",
          identifier: JSON.stringify({
            channel: `GameChannel`,
            id: gameId,
          }),
        };
        ws.send(JSON.stringify(subscription));
        switch (sessionType) {
          case "host":
            hostInGame(gameId);
            break;
          case "guest":
            guestInGame(gameId);
            break;
        }
      };

      ws.onmessage = (event) => {
        const response = JSON.parse(event.data);
        const { message } = response;
        // Assuming your custom messages are encapsulated in another key like `data`
        if (response.type !== "ping") {
          // Check the custom `action` key
          console.log("Message from server ", message);
          if (message) {
            console.log("action from server ", message.action);
            switch (message.action) {
              case "game_ready":
                setGameReady(true);
                break;
              case "card_dealt":
                console.log("Card played: ", message);
                handleCardPlayed(message);
                break;
              case "round_winner":
                console.log("Round winner: ", message);
                handleRoundWinner(message);
                break;
              case "game_initiated":
                console.log("Game started: ", message);
                setGameStarted(true);
                break;
              // Add more cases as needed
            }
          }
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket Error: ", error);
      };

      setWebsocket(ws);
    }

    const closeWebSocket = () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };

    return closeWebSocket;
    // setTimeout(closeWebSocket, 1000);
  }, [gameId]);

  return {
    gameStarted,
    websocket,
    gameReady,
    battleReady,
    currentSessionCard,
    oppSessionCard,
    currenSessionScore,
    oppSessionScore,
    invalidateCardRound,
    exitLobby,
  };
};

export default useGameChannelWebsocket;
