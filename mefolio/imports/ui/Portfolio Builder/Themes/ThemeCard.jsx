import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Card, CardHeader, CardTitle, CardContent } from "../../Portfolio Preview/Card";

export function ThemeCard({ id, title, description, image, onApply }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleApply = async () => {
    setIsLoading(true);
    await onApply(id);
    setIsLoading(false);
    };

  return (
    <Card className="overflow-hidden bg-surface-fill border-2 border-line rounded-3xl shadow-sm transition-transform duration-300 hover:shadow-xl hover:-translate-y-2 group">
      {/* Image Section */}
      <div className="relative h-48 flex items-center justify-center bg-background overflow-hidden pointer-events-none select-none">
        {image ? (
          <img
            src={image}
            alt={title}
            width={400}
            height={192}
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

      <CardHeader className="p-5 pb-2">
        <CardTitle className="text-xl font-bold text-primary">{title}</CardTitle>
        <p className="mt-1 text-sm text-primary line-clamp-2">{description}</p>
      </CardHeader>

      <CardContent className="project-card-content">
        <div className="flex gap-3">
          <button onClick={handleApply} disabled={isLoading} className="flex-1 py-3 flex items-center justify-center gap-2 bg-background border border-alt text-alt rounded-xl font-bold text-sm hover:bg-alt/50 hover:text-background transition-all">
            {isLoading ? "Applying..." : "Apply Theme"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

ThemeCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  image: PropTypes.string,
};