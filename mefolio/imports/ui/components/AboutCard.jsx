import React from "react";
import { ProfileCard } from "./ProfileCard";

const AboutCard = () => {
  return (
    <ProfileCard
      name = "John Doe"
      title = "Full-Stack Developer"
      location= "Sydney, NSW"
      summary = "A concise one-line summary or tagline goes here. Team can replace with real content."
      imageUrl={null}
    />  
  );
};

export default AboutCard;
