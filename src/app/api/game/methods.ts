import { baseUrl } from "../base";

export const destroyGame = async (gameId: number) => {
  fetch(`${baseUrl}/games/${gameId}`, {
    method: "DELETE",
  });
};
