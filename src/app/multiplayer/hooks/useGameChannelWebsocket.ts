import { hostInGame, guestInGame } from "@/app/api/multiplayer";
import { useEffect, useState } from "react";
import { Card, sessionType } from "../types";

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
  invalidateCardRound: () => void;
} => {
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const [gameReady, setGameReady] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentSessionCard, setCurrentSessionCard] = useState<Card | null>(
    null
  );

  const [oppSessionCard, setOppSessionCard] = useState<Card | null>(null);

  const battleReady = currentSessionCard && oppSessionCard ? true : false;

  const handleCardPlayed = (message: any) => {
    if (message.session_id === currentPlayerSessionId) {
      setCurrentSessionCard(message.card);
    } else {
      setOppSessionCard(message.card);
    }
  };

  const invalidateCardRound = () => {
    setCurrentSessionCard(null);
    setOppSessionCard(null);
  };
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
              case "card_played":
                console.log("Card played: ", message);
                handleCardPlayed(message);
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
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };

    setTimeout(closeWebSocket, 1000);
  }, [gameId]);

  return {
    gameStarted,
    websocket,
    gameReady,
    battleReady,
    currentSessionCard,
    oppSessionCard,
    invalidateCardRound,
  };
};

export default useGameChannelWebsocket;
