"use client";

import { createContext, useContext } from "react";

/**
 * Communicates the work section's dismantle state from WorkStage down to
 * WorkIndex.
 *
 * `erased` is the number of projects that have been fully removed by the
 * pinned outro scroll. It changes at most once per project (not per frame),
 * so passing it through React costs a handful of renders for the whole
 * sequence. The per-frame fading itself is done with direct DOM writes in
 * WorkStage and never touches React.
 *
 * `staged` reports whether the pinned choreography is actually running. It is
 * false on narrow viewports and under reduced motion, where the sections fall
 * back to normal document flow.
 */
export const WorkStageContext = createContext({ erased: 0, staged: false });

export const useWorkStage = () => useContext(WorkStageContext);
