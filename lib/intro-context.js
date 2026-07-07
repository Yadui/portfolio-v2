"use client";

import { createContext, useContext } from "react";

/**
 * IntroContext — carries the `introComplete` boolean from HomeClient
 * down to any child client component (e.g. Projects) that gates entrance
 * animations on it.
 *
 * Default is `true` so that pages rendered without HomeClient (e.g. SSR
 * from a direct URL, or in tests) behave as if the preloader already ran.
 */
export const IntroContext = createContext(true);

export function useIntroComplete() {
  return useContext(IntroContext);
}
