import React from "react";
import ProfileCard from "./ProfileCard.jsx";
import Button from "./Button.jsx";

const Hero = () => (
    <div className="hero">
        <div className="hero-left">
            <h1>Sample Headline - Make it reactive</h1>
            <p>...sample info...</p>
            <div className="buttons">
                <Button text="Get in Touch" />
                <Button text="View Resume" />
            </div>
        </div>
        <div className="hero-right">
            <ProfileCard />
        </div>
    </div>
);

export default Hero;