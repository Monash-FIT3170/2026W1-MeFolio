import React from "react";
import { useState } from "react";

export const ProfileCard = ({ name, title, location, summary, imageUrl }) => {
  const initials = name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "?";

  return (
    <div style={{
      width: "100%",
      background: "var(--color-card)",
      borderRadius: "var(--radius)",
      border: "1px solid var(--color-border)",
      boxShadow: "var(--shadow-card)",
      padding: "var(--spacing-xl)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "var(--spacing-md)",
    }}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name || "Profile"}
          style={{
            width: 160, height: 160, borderRadius: "50%", objectFit: "cover",
            border: "2px solid var(--color-border)",
          }}
        />
      ) : (
        <div style={{
          width: 160, height: 160, borderRadius: "50%",
          background: "var(--color-primary)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 48, fontWeight: 500, color: "#fff", letterSpacing: 2,
        }}>
          {initials}
        </div>
      )}

      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-foreground)", margin: 0 }}>
          {name || "No name set"}
        </p>
        {title && (
          <p style={{ fontSize: "0.95rem", color: "var(--color-muted)", margin: 0 }}>{title}</p>
        )}
        {location && (
          <p style={{ fontSize: "0.875rem", color: "var(--color-muted)", margin: 0 }}>{location}</p>
        )}
        {summary && (
          <p style={{ fontSize: "0.875rem", color: "var(--color-muted)", margin: "var(--spacing-sm) 0 0", lineHeight: 1.6 }}>{summary}</p>
        )}
      </div>
    </div>
  );
};