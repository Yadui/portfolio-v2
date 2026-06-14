"use client";

/**
 * AudioPlayer — site-wide ambient background music with a floating
 * mute / unmute control pinned to the bottom-right corner.
 *
 * Browsers block autoplaying audio with sound until the user interacts with
 * the page, so we:
 *   1. Mount the <audio> (looped, low volume) but don't assume it can play.
 *   2. Try to start it; if the promise rejects (autoplay blocked), we arm a
 *      one-shot listener for the first real user gesture (pointerdown / keydown
 *      / scroll) and start playback then.
 *   3. Respect the user's explicit choice afterwards — toggling the button
 *      pauses/resumes and the preference is remembered in localStorage.
 *
 * The button shows a tiny animated equaliser while playing and a muted icon
 * when paused, so its state is always obvious.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { FaVolumeHigh, FaVolumeXmark } from "react-icons/fa6";

const TRACK_SRC = "/assets/audio/Time%20Flows%20Ever%20Onward.mp3";
const STORAGE_KEY = "ay-audio-muted";
const VOLUME = 0.35;

// Admin / utility routes where the floating control would get in the way.
const HIDDEN_PREFIXES = ["/login", "/blog/create", "/blog/edit"];

export default function AudioPlayer() {
  const pathname = usePathname();
  const audioRef = useRef(null);
  // `playing` = audio is currently audible (not muted, actively playing).
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  const hidden = HIDDEN_PREFIXES.some((p) => pathname?.startsWith(p));

  // Whether the visitor previously chose to keep sound off.
  const userMutedRef = useRef(false);
  useEffect(() => {
    try {
      userMutedRef.current = window.localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      userMutedRef.current = false;
    }
    setReady(true);
  }, []);

  // Attempt to begin playback (used on mount + on first gesture).
  const tryPlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || userMutedRef.current) return;
    try {
      audio.volume = VOLUME;
      await audio.play();
      setPlaying(true);
    } catch {
      // Autoplay blocked — will retry on first user gesture.
      setPlaying(false);
    }
  }, []);

  // On mount (and route changes that keep the player mounted): try to play,
  // and arm a fallback that starts on the first user interaction.
  useEffect(() => {
    if (!ready || hidden) return undefined;

    tryPlay();

    const onFirstGesture = () => {
      tryPlay();
    };

    const opts = { once: true, passive: true };
    window.addEventListener("pointerdown", onFirstGesture, opts);
    window.addEventListener("keydown", onFirstGesture, opts);
    window.addEventListener("touchstart", onFirstGesture, opts);
    window.addEventListener("wheel", onFirstGesture, opts);

    return () => {
      window.removeEventListener("pointerdown", onFirstGesture);
      window.removeEventListener("keydown", onFirstGesture);
      window.removeEventListener("touchstart", onFirstGesture);
      window.removeEventListener("wheel", onFirstGesture);
    };
  }, [ready, hidden, tryPlay]);

  // Mute/unmute on tab visibility — pause when the user switches away,
  // resume when they come back (only if they hadn't manually muted).
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    const onVisibility = () => {
      if (document.hidden) {
        audio.pause();
        // Don't touch playing state or userMutedRef — this is a temporary
        // system pause, not a user preference change.
      } else {
        // Only resume if the user hadn't explicitly muted before hiding.
        if (!userMutedRef.current) {
          audio.play().catch(() => {});
        }
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
      userMutedRef.current = true;
      try {
        window.localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
    } else {
      userMutedRef.current = false;
      try {
        window.localStorage.setItem(STORAGE_KEY, "0");
      } catch {
        /* ignore */
      }
      audio.volume = VOLUME;
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    }
  }, [playing]);

  if (hidden) return null;

  return (
    <>
      {/* Looped, preloaded ambient track. */}
      <audio ref={audioRef} src={TRACK_SRC} loop preload="auto" />

      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? "Mute background music" : "Play background music"}
        title={playing ? "Mute" : "Play music"}
        className="group fixed bottom-5 right-5 z-[120] flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-white/40 hover:bg-black/90 md:bottom-6 md:right-6 md:h-12 md:w-12"
      >
        {playing ? (
          // Animated equaliser bars while audible.
          <span className="flex items-end gap-[2px]" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="ay-eq-bar"
                style={{ animationDelay: `${i * 0.12}s` }}
              />
            ))}
          </span>
        ) : (
          <FaVolumeXmark className="text-base text-white/70 transition-colors group-hover:text-white" />
        )}

        {/* Screen-reader fallback icon (hidden visually). */}
        <span className="sr-only">
          {playing ? <FaVolumeHigh /> : <FaVolumeXmark />}
        </span>
      </button>
    </>
  );
}
