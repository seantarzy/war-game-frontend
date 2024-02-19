interface Player {
  id: string;
  name: string;
  war: string;
  image: string;
  role: "hitter" | "pitcher";
}
interface Batter extends Player {
  role: "hitter";
  avg: string;
  hits: string;
  hr: string;
  rbi: string;
  runs: string;
}

interface Pitcher extends Player {
  role: "pitcher";
  era: string;
  wins: string;
  losses: string;
  saves: string;
  strikeouts: string;
}

export type Card = Batter | Pitcher;

interface BattlePayload {
  card1: Batter | Pitcher;
  card2: Batter | Pitcher;
}

export type sessionType = "host" | "guest";

// avg
// :
// ".345"
// created_at
// :
// "2024-02-14T03:42:26.649Z"
// era
// :
// null
// hits
// :
// "3514"
// hr
// :
// "117"
// id
// :
// 9
// image
// :
// "https://www.baseball-reference.com/req/202311300/images/headshots/6/6d9f34bd_sabr_bos.jpg"
// image_secondary
// :
// "https://www.baseball-reference.com/req/202311300/images/headshots/6/6d9f34bd_davis.jpg"
// ip
// :
// null
// losses
// :
// null
// name
// :
// "Tris Speaker"
// rbi
// :
// "1531"
// role
// :
// "hitter"
// runs
// :
// "1882"
// saves
// :
// null
// stolen_bases
// :
// "436"
// strikeouts
// :
// null
// updated_at
// :
// "2024-02-14T03:42:26.649Z"
// war
// :
// "134.9"
// wins
// :
// null
// [[Prototype]]
// :
// Object
