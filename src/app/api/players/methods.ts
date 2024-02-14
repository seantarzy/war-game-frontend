import { baseUrl } from "../base";
export async function getRandomPlayer() {
  const res = await fetch(`${baseUrl}/random_player`);
  return res.json();
}
