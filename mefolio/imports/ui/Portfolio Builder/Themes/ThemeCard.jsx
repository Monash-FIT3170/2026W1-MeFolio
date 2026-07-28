import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Card, CardHeader, CardTitle, CardContent } from "../../Portfolio Preview/Card";

export function ThemeCard({ id, title, description, image, isActive, onApply }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleApply = async () => {
    if (isActive) return;
    setIsLoading(true);
    await onApply(id);
    setIsLoading(false);
    };

  return (
    <Card className="overflow-hidden bg-surface-fill border-2 border-line rounded-3xl shadow-sm transition-transform duration-300 hover:shadow-xl hover:-translate-y-2 group flex flex-col h-full">
      <div className="relative aspect-[787/531] w-full flex items-center justify-center bg-background overflow-hidden pointer-events-none select-none">
        {image ? (
          <img
            src={image}
            alt={title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="text-[11px] font-extrabold text-primary uppercase tracking-widest text-muted-foreground">
            No Image Provided
          </div>
        )}
      </div>

      <CardHeader className="p-5 pb-2 flex-1">
        <CardTitle className="text-xl font-bold text-primary">{title}</CardTitle>
        <p className="mt-1 text-sm text-primary">{description}</p>
      </CardHeader>

      <CardContent className="project-card-content">
        <div className="flex gap-3">
          <button 
            onClick={handleApply} 
            disabled={isLoading || isActive} 
            className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-xl font-bold text-sm transition-all ${
              isActive 
                ? "bg-button text-background cursor-default opacity-100" 
                : "bg-background border border-alt text-alt hover:bg-alt/50 hover:text-background"
            }`}
          >
            {isLoading ? "Applying..." : isActive ? "Active Theme" : "Apply Theme"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

ThemeCard.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  image: PropTypes.string,
  isActive: PropTypes.bool,
  onApply: PropTypes.func.isRequired,
};