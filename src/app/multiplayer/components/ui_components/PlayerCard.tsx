import { useSpring, animated } from "@react-spring/web";
import { Card } from "../../types";
import { BaseCardLayout } from "./BaseLayout";
import { CardBack } from "./Deck";

export function PlayerCard({
  player,
  side,
  flipped,
}: {
  player: Card;
  side: "current" | "opponent";
  flipped: boolean; // This prop determines if the card is flipped to show the back
}) {
  // Spring animation for flipping
  const { transform, opacity } = useSpring({
    opacity: flipped ? 1 : 0,
    transform: `perspective(600px) rotateY(${flipped ? 180 : 0}deg)`,
    config: { mass: 5, tension: 500, friction: 80 },
  });

  return (
    <BaseCardLayout>
      <div className="relative w-full h-full">
        {/* Front side of the card */}
        <animated.div
          className="absolute w-full h-full bg-blue-600 border-gray-100 border-2 flex flex-col justify-center items-center"
          style={{
            opacity: opacity.to((o: any) => 1 - o),
            transform,
          }}
        >
          <h2>{player.name}</h2>
          <img
            src={player.image}
            alt={player.name}
            className="w-[90%] h-[80%]"
          />
          <div>WAR: {player.war}</div>
        </animated.div>
        <animated.div
          className="absolute w-full h-full"
          style={{
            opacity,
            transform: transform.to((t: any) => `${t} rotateY(180deg)`),
          }}
        >
          <CardBack />
        </animated.div>
      </div>
    </BaseCardLayout>
  );
}
