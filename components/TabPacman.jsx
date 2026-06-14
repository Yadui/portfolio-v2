"use client";

import { useEffect } from "react";

const TabPacman = () => {
  useEffect(() => {
    // Capture the real title after the page has set it.
    // Trim because some browsers append whitespace.
    const originalTitle = document.title?.trim() || "Abhinav Yadav";

    let frame = 0;
    let interval = null;

    const PACMAN = ["ᗧ•", "ᗧ "];
    const DOT = "·";
    const SPACE = "\u00A0";
    const TRACK_LENGTH = 10;
    const SPEED = 200;

    const animate = () => {
      const pacman = PACMAN[frame % 2];
      const pos = frame % TRACK_LENGTH;

      let track = "";
      for (let i = 0; i < TRACK_LENGTH; i++) {
        if (i === pos) track += pacman;
        else if (i > pos) track += DOT;
        else track += SPACE;
      }

      document.title = track || originalTitle;
      frame++;
    };

    const start = () => {
      if (interval) return;          // already running
      frame = 0;
      interval = setInterval(animate, SPEED);
    };

    const stop = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      document.title = originalTitle;
    };

    const onVisibility = () => {
      if (document.hidden) {
        start();   // tab went away → play pacman
      } else {
        stop();    // tab came back → restore real title
      }
    };

    document.addEventListener("visibilitychange", onVisibility);

    // DO NOT call start() here — the animation only runs while hidden.

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return null;
};

export default TabPacman;
