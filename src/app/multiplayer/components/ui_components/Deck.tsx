import React, { memo } from "react";
import {
  useSpring,
  animated,
  SpringValues,
  to as interpolateTo,
} from "@react-spring/web";
import CardBackImage from "../../../assets/war-games-back.jpeg";
import Image, { StaticImageData } from "next/image";

import { Card } from "../../types";
import "./Deck.css";
export function CardBack() {
  return (
    <BaseCardLayout>
      <Image src={CardBackImage} alt="card back" className="h-full w-full" />
    </BaseCardLayout>
  );
}

export function CardInDeck({
  style,
  imgSrc,
}: {
  style?: React.CSSProperties;
  imgSrc?: StaticImageData;
}) {
  return (
    <BaseCardLayout>
      <div
        style={{
          ...style,
          width: "100%",
          height: "100%",
          position: "absolute",
        }}
      >
        <Image
          src={imgSrc || CardBackImage}
          alt="card back"
          layout="fill"
          objectFit="cover"
        />
      </div>
    </BaseCardLayout>
  );
}

function BaseCardLayout({ children }: { children: React.ReactNode }) {
  return <div className="h-56 w-40">{children}</div>;
}

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
    transform: `perspective(1000px) rotateY(${flipped ? 180 : 0}deg)`,
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
        <CardBack />
        <animated.div
          className="absolute w-full h-full"
          style={{
            opacity,
            transform: transform.to((t: any) => `${t} rotateY(180deg)`),
          }}
        />
      </div>
    </BaseCardLayout>
  );
}
export function CardStack({
  fromDirection,
}: {
  fromDirection?: "left" | "right";
}) {
  const cards = new Array(10).fill(0); // Adjust the number of cards as needed

  const cardStyles = cards.map((_, index) => ({
    zIndex: index,
    transform: `translate(${Math.random() * 10 - 5}px, ${
      index * -4
    }px) rotate(${Math.random() * 20 - 10}deg)`,
    left: `${index * -1}px`,
    animation: `slide-in-from-${fromDirection} ${0.5 + index * 0.1}s ease-out`,
    key: `${fromDirection}--${index}`,
  }));

  return (
    <div className="relative flex flex-col h-full justify-center items-center">
      <div className="card-stack-container">
        {cardStyles.map((style, index) => (
          <CardInDeck key={style.key} style={style} imgSrc={CardBackImage} />
        ))}
      </div>
    </div>
  );
}
