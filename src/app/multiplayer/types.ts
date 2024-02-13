interface Batter {
  id: string;
  name: string;
  H: number;
  AB: number;
  R: number;
  RBI: number;
  BB: number;
}

interface Pitcher {
  id: string;
  name: string;
  IP: number;
  H: number;
  ER: number;
  BB: number;
  K: number;
}

export type Card = Batter | Pitcher;

interface BattlePayload {
  card1: Batter | Pitcher;
  card2: Batter | Pitcher;
}

export type sessionType = "host" | "guest";
