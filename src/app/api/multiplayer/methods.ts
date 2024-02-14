import { baseUrl } from "../base";

// creates the game and stores the game id, game code, session id, and session type in local storage, and activates the game channel
export const createGame = async () => {
  const res = await fetch(`${baseUrl}/create_multiplayer_game`, {
    method: "POST",
  });

  return res.json();
};

// joins the game and stores the game id, session id, and session type in local storage, and activates the game channel
export const joinGame = async (gameCode: string) => {
  const res = await fetch(`${baseUrl}/join_multiplayer_game`, {
    method: "POST",
    body: JSON.stringify({ invite_code: gameCode }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.json();
};

// these methods signal whether we are waiting for a guest to join, the game is ready to start, or something went wrong

export const hostInGame = async (gameId: number) => {
  const res = await fetch(
    `${baseUrl}/handle_host_game_state?game_id=${gameId}`
  );
  return res.json();
};

export const guestInGame = async (gameId: number) => {
  const res = await fetch(
    `${baseUrl}/handle_guest_game_state?game_id=${gameId}`
  );
  return res.json();
};

export const dealCard = async (
  gameId: number,
  sessionId: number,
  playerId: number
) => {
  const res = await fetch(`${baseUrl}/deal_card`, {
    method: "POST",
    body: JSON.stringify({
      game_id: gameId,
      player_id: playerId,
      session_id: sessionId,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.json();
};
