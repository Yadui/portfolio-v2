"use client";

import {
  ElementType,
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * MediaBetweenText — renders a media element (image or video) that expands
 * between two text nodes. Trigger the reveal on hover, inView, or via a ref.
 *
 * Adapted from fancycomponents.dev/docs/components/blocks/media-between-text
 */
const MediaBetweenText = forwardRef(
  (
    {
      firstText,
      secondText,
      mediaUrl,
      mediaType,
      mediaContainerClassName,
      fallbackUrl,
      as = "p",
      autoPlay = true,
      loop = true,
      muted = true,
      playsInline = true,
      alt,
      triggerType = "hover",
      containerRef,
      useInViewOptionsProp = {
        once: true,
        amount: 0.5,
        root: containerRef,
      },
      animationVariants = {
        initial: { width: 0, opacity: 1 },
        animate: {
          width: "auto",
          opacity: 1,
          transition: { duration: 0.4, type: "spring", bounce: 0 },
        },
      },
      className,
      leftTextClassName,
      rightTextClassName,
      children,
    },
    ref
  ) => {
    const componentRef = useRef(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Always call the hook (Rules of Hooks); only use its result when the
    // trigger is "inView".
    const inViewResult = useInView(componentRef, useInViewOptionsProp);
    const isInView = triggerType === "inView" ? inViewResult : false;

    useImperativeHandle(ref, () => ({
      animate: () => setIsAnimating(true),
      reset: () => setIsAnimating(false),
    }));

    const shouldAnimate =
      triggerType === "hover"
        ? isHovered
        : triggerType === "inView"
          ? isInView
          : triggerType === "ref"
            ? isAnimating
            : false;

    const TextComponent = motion.create(as);

    return (
      <div
        className={cn("flex", className)}
        ref={componentRef}
        onMouseEnter={() => triggerType === "hover" && setIsHovered(true)}
        onMouseLeave={() => triggerType === "hover" && setIsHovered(false)}
      >
        <TextComponent layout className={leftTextClassName}>
          {firstText}
        </TextComponent>

        {/* Slotted content (e.g. a rotating icon) OR a media URL */}
        <motion.div
          className={mediaContainerClassName}
          variants={animationVariants}
          initial="initial"
          animate={shouldAnimate ? "animate" : "initial"}
        >
          {children ? (
            children
          ) : mediaType === "video" ? (
            <video
              className="h-full w-full object-cover"
              autoPlay={autoPlay}
              loop={loop}
              muted={muted}
              playsInline={playsInline}
              poster={fallbackUrl}
            >
              <source src={mediaUrl} type="video/mp4" />
            </video>
          ) : (
            <img
              src={mediaUrl}
              alt={alt || `${firstText} ${secondText}`}
              className="h-full w-full object-cover"
            />
          )}
        </motion.div>

        <TextComponent layout className={rightTextClassName}>
          {secondText}
        </TextComponent>
      </div>
    );
  }
);

MediaBetweenText.displayName = "MediaBetweenText";
export default MediaBetweenText;
