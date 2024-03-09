import React from "react";
import style from "./card.module.scss";

const Card = ({ title }) => {
  return <article className={style.card}>{title}</article>;
};

export default Card;
