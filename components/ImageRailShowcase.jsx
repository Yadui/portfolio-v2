"use client";

import { useEffect, useRef, useState } from "react";

const baseShowcaseBlocks = [
  {
    label: "Amber block",
    color: "#f59e0b",
  },
  {
    label: "Coral block",
    color: "#f97316",
  },
  {
    label: "Rose block",
    color: "#ef4444",
  },
  {
    label: "Berry block",
    color: "#ec4899",
  },
  {
    label: "Sky block",
    color: "#38bdf8",
  },
  {
    label: "Mint block",
    color: "#34d399",
  },
  {
    label: "Lime block",
    color: "#84cc16",
  },
  {
    label: "Stone block",
    color: "#78716c",
  },
];

const SHOWCASE_ITEM_COUNT = 24;
const FRAME_ASPECT_RATIO = 1;
const MIN_FRAME_HEIGHT_RATIO = 0.12;
const MAX_FRAME_HEIGHT_RATIO = 0.65;
const WHEEL_TRAVEL_MULTIPLIER = 1;

const showcaseBlocks = Array.from({ length: SHOWCASE_ITEM_COUNT }, (_, index) => {
  const base = baseShowcaseBlocks[index % baseShowcaseBlocks.length];

  return {
    ...base,
    id: index + 1,
    label: `${base.label} ${String(index + 1).padStart(2, "0")}`,
  };
});

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const lerp = (start, end, progress) => start + ((end - start) * progress);

const snapPixel = (value) => Math.round(value);

const getFrameMetrics = (left, viewportWidth, viewportHeight) => {
  const safeWidth = Math.max(viewportWidth, 1);
  const safeHeight = Math.max(viewportHeight, 1);
  const minHeight = Math.max(safeHeight * MIN_FRAME_HEIGHT_RATIO, 72);
  const maxHeight = safeHeight * MAX_FRAME_HEIGHT_RATIO;
  let height = minHeight;
  let width = minHeight * FRAME_ASPECT_RATIO;

  for (let step = 0; step < 3; step += 1) {
    const progress = clamp((left + width) / safeWidth, 0, 1);
    const easedProgress = Math.pow(progress, 1.1);

    height = lerp(minHeight, maxHeight, easedProgress);
    width = height * FRAME_ASPECT_RATIO;
  }

  return {
    width,
    height,
  };
};

const normalizeRailState = (state, delta, viewportWidth, viewportHeight) => {
  if (!viewportWidth || !viewportHeight) {
    return state;
  }

  const itemCount = showcaseBlocks.length;

  if (itemCount === 0) {
    return state;
  }

  let headIndex = state.headIndex;
  let headOffset = state.headOffset + delta;
  const minFrameWidth = getFrameMetrics(-viewportWidth, viewportWidth, viewportHeight).width;
  const loopBudget = Math.max(
    itemCount * 6,
    Math.ceil(Math.abs(delta) / Math.max(minFrameWidth, 1)) + (itemCount * 2),
  );
  let safetyCounter = loopBudget;

  while (headOffset > 0 && safetyCounter > 0) {
    headIndex = (headIndex - 1 + itemCount) % itemCount;
    headOffset -= minFrameWidth;
    safetyCounter -= 1;
  }

  safetyCounter = loopBudget;
  let currentWidth = getFrameMetrics(headOffset, viewportWidth, viewportHeight).width;

  while (headOffset + currentWidth <= 0 && safetyCounter > 0) {
    headOffset += currentWidth;
    headIndex = (headIndex + 1) % itemCount;
    currentWidth = getFrameMetrics(headOffset, viewportWidth, viewportHeight).width;
    safetyCounter -= 1;
  }

  return {
    headIndex,
    headOffset,
  };
};

const buildVisibleBlocks = (state, viewportWidth, viewportHeight) => {
  if (!viewportWidth || !viewportHeight) {
    return [];
  }

  const visibleBlocks = [];
  const itemCount = showcaseBlocks.length;
  const exitThreshold =
    viewportWidth + (viewportHeight * MAX_FRAME_HEIGHT_RATIO * FRAME_ASPECT_RATIO);
  let currentIndex = state.headIndex;
  let currentLeft = snapPixel(state.headOffset);
  let safetyCounter = itemCount * 5;

  while (currentLeft < exitThreshold && safetyCounter > 0) {
    const block = showcaseBlocks[currentIndex];
    const { width, height } = getFrameMetrics(currentLeft, viewportWidth, viewportHeight);
    const snappedWidth = Math.max(1, snapPixel(width));
    const snappedHeight = Math.max(1, snapPixel(height));

    visibleBlocks.push({
      key: `${block.id}-${safetyCounter}`,
      left: currentLeft,
      width: snappedWidth,
      height: snappedHeight,
      color: block.color,
      label: block.label,
    });

    currentLeft += snappedWidth;
    currentIndex = (currentIndex + 1) % itemCount;
    safetyCounter -= 1;
  }

  return visibleBlocks;
};

const ShowcaseBlock = ({ block }) => {
  return (
    <div
      data-rail-block
      style={{
        width: `${block.width}px`,
        height: `${block.height}px`,
        transform: `translate3d(${block.left}px, 0, 0)`,
        backgroundColor: block.color,
      }}
      className="absolute bottom-0 left-0"
      role="img"
      aria-label={block.label}
    />
  );
};

const ImageRailShowcase = ({
  enableWheel = true,
  title = "Scroll-driven image showcase",
}) => {
  const viewportRef = useRef(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [railState, setRailState] = useState({ headIndex: 0, headOffset: 0 });

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return undefined;
    }

    const updateViewportSize = () => {
      const nextWidth = viewport.clientWidth;
      const nextHeight = viewport.clientHeight;

      setViewportSize((currentSize) => {
        if (currentSize.width === nextWidth && currentSize.height === nextHeight) {
          return currentSize;
        }

        return {
          width: nextWidth,
          height: nextHeight,
        };
      });
    };

    updateViewportSize();

    const resizeObserver = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(() => {
          updateViewportSize();
        });

    resizeObserver?.observe(viewport);
    window.addEventListener("resize", updateViewportSize);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateViewportSize);
    };
  }, []);

  useEffect(() => {
    setRailState((currentState) =>
      normalizeRailState(
        currentState,
        0,
        viewportSize.width,
        viewportSize.height,
      ),
    );
  }, [viewportSize.height, viewportSize.width]);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!enableWheel || !viewport || !viewportSize.width || !viewportSize.height) {
      return undefined;
    }

    const handleWheel = (event) => {
      const primaryDelta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;

      if (primaryDelta === 0) {
        return;
      }

      event.preventDefault();

      setRailState((currentState) =>
        normalizeRailState(
          currentState,
          primaryDelta * WHEEL_TRAVEL_MULTIPLIER,
          viewportSize.width,
          viewportSize.height,
        ),
      );
    };

    viewport.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      viewport.removeEventListener("wheel", handleWheel);
    };
  }, [enableWheel, viewportSize.height, viewportSize.width]);

  const visibleBlocks = buildVisibleBlocks(
    railState,
    viewportSize.width,
    viewportSize.height,
  );

  return (
    <div className="portfolio-paper-stage relative h-full w-full overflow-hidden overscroll-none">
      <div
        className="absolute inset-0 pointer-events-none opacity-35"
        style={{
          backgroundImage:
            "linear-gradient(rgba(16,24,40,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(16,24,40,0.04) 1px, transparent 1px)",
          backgroundSize: "88px 88px",
          maskImage: "linear-gradient(180deg, rgba(0,0,0,0.28), transparent 88%)",
        }}
      />

      <h1 className="sr-only">{title}</h1>

      <section className="relative h-full">
        <div ref={viewportRef} className="relative h-full overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            {visibleBlocks.map((block) => (
              <ShowcaseBlock key={block.key} block={block} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ImageRailShowcase;