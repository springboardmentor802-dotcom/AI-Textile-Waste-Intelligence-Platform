import React from "react";
import "../styles/Hero.css";
import heroImage from "../assets/hero.png";

function Hero() {
    return (
        <section className="hero">
            <div className="hero-content">
                <h1>Welcome to AI Textile Waste Intelligence Platform</h1>

                <p>
                    An AI-powered platform for textile waste classification and
                    recycling.
                </p>

                <button>Get Started</button>
            </div>

            <div className="hero-image">
                <img src={heroImage} alt="AI Textile Waste" />
            </div>
        </section>
    );
}

export default Hero;