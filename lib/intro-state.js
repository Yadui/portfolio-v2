// Module-level intro state: the home preloader marks completion here, and
// chrome that should stay hidden during the intro (site header) subscribes.
// Module state survives client-side route changes but resets on hard reload —
// exactly the lifetime we want for "play the intro once per visit".
let done = false;
const listeners = new Set();

export const isIntroDone = () => done;

export const markIntroDone = () => {
  if (done) return;
  done = true;
  listeners.forEach((listener) => listener());
};

export const onIntroDone = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
