import React, { useState } from 'react';
import { Github, ExternalLink, Code, Play, Star, Mic } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import './ProjectCard.css';

export function ProjectCard({ project }) {
  const [showMockChallenge, setShowMockChallenge] = useState(false);
  
  const data = project || {
    title: "Project Title",
    description: "Description placeholder.",
    tech: ["React"],
    stars: 0,
    challengeName: "Challenge Title"
  };

  return (
    <Card className="project-card-main">
      {/* Top Image & Star Section */}
      <div className="project-card-image-section">
        {data.imageUrl && !imageError ? (
          <img 
            src={data.imageUrl} 
            alt={data.title}
            className="project-image-content"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="image-placeholder-container">
            <span className="image-placeholder-text">Preview Coming Soon</span>
          </div>
        )}
        <div className="project-card-star-badge">
          <Star className="star-icon" />
          <span className="star-rating-text">{data.stars}</span>
        </div>
      </div>

      <CardHeader>
        <CardTitle className="project-card-title">{data.title}</CardTitle>
        <p className="project-card-description">{data.description}</p>
      </CardHeader>

      <CardContent className="project-card-content">
        {/* Tech Stack Badges */}
        <div className="project-card-tech-list">
          {data.tech.map((t) => <span key={t} className="tech-badge">{t}</span>)}
        </div>

        {/* Voice Summary Button */}
        <button disabled className="btn-voice-mock">
          <Mic className="icon-small" /> 
          <span className="btn-text">Voice Summary</span>
        </button>

        {/* Mini Challenge Section */}
        <div className="challenge-section">
          <div className="challenge-header">
            <Code className="challenge-icon" />
            <span className="challenge-label">Mini Challenge</span>
          </div>
          <p className="challenge-subtext">{data.challengeName}</p>
          <button 
            onClick={() => setShowMockChallenge(!showMockChallenge)} 
            className="btn-challenge-preview"
          >
            <Play className="icon-play" /> 
            <span className="btn-text">Try Challenge</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="project-card-actions">
          <button className="btn-action-secondary">
            <Github className="icon-small" /> 
            <span className="btn-text">Code</span>
          </button>
          <button className="btn-action-primary">
            <ExternalLink className="icon-small" /> 
            <span className="btn-text">Demo</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}