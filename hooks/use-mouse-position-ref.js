import { useEffect, useRef } from "react"

/**
 * Like useMousePosition but returns a ref instead of state —
 * so consumers can read the latest value inside animation loops
 * without triggering re-renders.
 */
export function useMousePositionRef(containerRef) {
  const positionRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const update = (x, y) => {
      if (containerRef?.current) {
        const rect = containerRef.current.getBoundingClientRect()
        positionRef.current = {
          x: x - rect.left - rect.width / 2,
          y: y - rect.top - rect.height / 2,
        }
      } else {
        positionRef.current = { x, y }
      }
    }

    const onMouse = (e) => update(e.clientX, e.clientY)
    const onTouch = (e) => {
      const t = e.touches[0]
      update(t.clientX, t.clientY)
    }

    window.addEventListener("mousemove", onMouse)
    window.addEventListener("touchmove", onTouch, { passive: true })
    return () => {
      window.removeEventListener("mousemove", onMouse)
      window.removeEventListener("touchmove", onTouch)
    }
  }, [containerRef])

  return positionRef
}
