import React from "react";
import { ProfileCard } from "./ProfileCard";

const AboutCard = ({ name, title, location, summary, imageUrl }) => {
  return (
    <ProfileCard
      name={name}
      title={title}
      location={location}
      summary={summary}
      imageUrl={imageUrl || null}
    />
  );
};

export default AboutCard;
