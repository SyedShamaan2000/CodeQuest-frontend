import React, { useEffect, useState } from "react";
import "./FullscreenGuard.css"; // create tiny CSS below

export default function FullscreenGuard({ children }) {
  const [isFull, setIsFull] = useState(
    Boolean(document.fullscreenElement || document.webkitFullscreenElement)
  );

  /* helper to request FS when user clicks button */
  const requestFS = () => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  };

  useEffect(() => {
    const handler = () =>
      setIsFull(Boolean(document.fullscreenElement || document.webkitFullscreenElement));
    document.addEventListener("fullscreenchange", handler);
    document.addEventListener("webkitfullscreenchange", handler); // Safari
    return () => {
      document.removeEventListener("fullscreenchange", handler);
      document.removeEventListener("webkitfullscreenchange", handler);
    };
  }, []);

  if (!isFull) {
    return (
      <div className="fs-overlay">
        <div className="fs-box">
          <h2>🔒 Full-screen required</h2>
          <p>This exam must be taken in full-screen mode.&nbsp;
             Please click the button below or press <kbd>F11</kbd>.</p>
          <button className="fs-button" onClick={requestFS}>
            Enter full-screen
          </button>
        </div>
      </div>
    );
  }

  return children;
}
