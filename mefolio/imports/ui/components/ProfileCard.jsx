import React from "react";

export const ProfileCard = ({ name, title, location, status, stack, imageUrl }) => {
  const initials = name ? name.spilt(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "?";
  return (
    <div style={{ position: "relative", width: "320px" }}>
      <div style={{
        position: "absolute", inset:0,
        borderRadius: "20px", padding: "3px",
        background: "linear-gradient(135deg, #7c3aed, #ec4899)",
        WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
      }} />

      <div style={{ background: "#fff", borderRadius: "18px",
        padding: "2.5rem 2rem 2rem",
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: "1.25rem",
        position: "relative",
      }}>
        {/*avatar*/}
        {imageUrl ? (
          <img
          src={imageUrl}
          alt={name || "Profile"}
          style={{
            width: 120, height: 120, borderRadius: "50%", objectFit: "cover",
            border: "3px solid #7c3aed",
          }}
          />
        ) : (
          <div style={{
            width: 120, height: 120, borderRadius: "50%",
            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 36, fontWeight: 500, color: "#fff", letterSpacing: 2,
          }}>
            {initials}
            </div>
        )}

        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 17, fontWeight: 500, margin: "0 0 4px" }}>
            {name || "No name set"}
          </p>
          {title && (
            <p style={{ fontSize: 17, fontWeight: 500, margin: "0 0 4px" }}>{title}</p>
          )}
          {location && (
            <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>{location}</p>
          )}
        </div>

        {(status || stack) && (
          <div style={{
            width: "100%",
            borderTop: "0.5px solid #e5e7eb",
            paddingTop: "1rem",
            display: "flex", flexDirection: "column", gap: 8,
          }}>
            {status && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "#6b7280" }}>Status</span>
                <span style={{ color: "#7c3aed", fontWeight: 500 }}>{status}</span>
              </div>
            )}
            {stack && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13}}>
                <span style={{ color: "#6b7280" }}>Stack</span>
                <span>{stack}</span>
                </div>
            )}
            </div>
        )}
        </div>
    </div>
  );
};