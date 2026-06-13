"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react"
import { useAnimationFrame } from "framer-motion"

import { useMousePositionRef } from "@/hooks/use-mouse-position-ref"

const FloatingContext = createContext(null)

const Floating = ({
  children,
  className = "",
  sensitivity = 1,
  easingFactor = 0.05,
  ...props
}) => {
  const containerRef = useRef(null)
  const elementsMap = useRef(new Map())
  const mousePositionRef = useMousePositionRef(containerRef)

  const registerElement = useCallback((id, element, depth) => {
    elementsMap.current.set(id, {
      element,
      depth,
      currentPosition: { x: 0, y: 0 },
    })
  }, [])

  const unregisterElement = useCallback((id) => {
    elementsMap.current.delete(id)
  }, [])

  useAnimationFrame(() => {
    if (!containerRef.current) return
    elementsMap.current.forEach((data) => {
      const strength = (data.depth * sensitivity) / 20
      const targetX = mousePositionRef.current.x * strength
      const targetY = mousePositionRef.current.y * strength
      const dx = targetX - data.currentPosition.x
      const dy = targetY - data.currentPosition.y
      data.currentPosition.x += dx * easingFactor
      data.currentPosition.y += dy * easingFactor
      data.element.style.transform = `translate3d(${data.currentPosition.x}px, ${data.currentPosition.y}px, 0)`
    })
  })

  return (
    <FloatingContext.Provider value={{ registerElement, unregisterElement }}>
      <div
        ref={containerRef}
        className={`absolute inset-0 w-full h-full ${className}`}
        {...props}
      >
        {children}
      </div>
    </FloatingContext.Provider>
  )
}

export default Floating

export const FloatingElement = ({
  children,
  className = "",
  style,
  depth = 1,
}) => {
  const elementRef = useRef(null)
  const idRef = useRef(Math.random().toString(36).substring(7))
  const context = useContext(FloatingContext)

  useEffect(() => {
    if (!elementRef.current || !context) return
    context.registerElement(idRef.current, elementRef.current, depth ?? 0.01)
    return () => context.unregisterElement(idRef.current)
  }, [depth, context])

  return (
    // Outer div: animated by the parallax loop (transform only)
    <div
      ref={elementRef}
      className={`absolute will-change-transform ${className}`}
    >
      {/* Inner div: carries the static pixel offset via inline style */}
      <div style={style}>
        {children}
      </div>
    </div>
  )
}
