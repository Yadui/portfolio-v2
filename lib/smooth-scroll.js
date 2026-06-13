// Tiny module-level store for the active Lenis instance so any client
// component (header menu, preloader lock, back-to-top, anchor links) can
// stop/start/scrollTo without prop-drilling or context re-renders.
let lenisInstance = null;

export const setLenis = (lenis) => {
  lenisInstance = lenis;
};

export const getLenis = () => lenisInstance;
