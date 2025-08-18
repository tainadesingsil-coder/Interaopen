import { useEffect, useRef } from 'react'

export default function Cursor() {
	const cursorRef = useRef<HTMLDivElement | null>(null)
	const rafRef = useRef<number | null>(null)
	const pulseTimerRef = useRef<number | null>(null)
	const posRef = useRef({ x: 0, y: 0 })
	const lerpRef = useRef({ x: 0, y: 0 })
	const visibleRef = useRef(false)

	useEffect(() => {
		if (window.matchMedia && !window.matchMedia('(pointer: fine)').matches) return

		const el = document.createElement('div')
		el.className = 'app-cursor'
		el.setAttribute('aria-hidden', 'true')
		el.style.opacity = '0'
		document.body.appendChild(el)
		cursorRef.current = el

		const isClickable = (target: Element | null): boolean => {
			if (!target) return false
			const tag = (target as HTMLElement).tagName
			if (tag === 'A' || tag === 'BUTTON') return true
			if (target instanceof HTMLElement) {
				const role = target.getAttribute('role')
				if (role === 'button') return true
				if (target.closest('a,button,[role="button"],input[type="submit"],input[type="button"],.btn-yellow,.btn-blue')) return true
			}
			return false
		}

		const onMouseMove = (e: MouseEvent) => {
			posRef.current.x = e.clientX
			posRef.current.y = e.clientY
			if (!visibleRef.current) {
				visibleRef.current = true
				el.style.opacity = '1'
			}
			// pulse on movement
			el.classList.add('app-cursor--pulse')
			if (pulseTimerRef.current) window.clearTimeout(pulseTimerRef.current)
			pulseTimerRef.current = window.setTimeout(() => {
				el.classList.remove('app-cursor--pulse')
			}, 150)
		}

		const onMouseEnter = () => {
			visibleRef.current = true
			el.style.opacity = '1'
		}
		const onMouseLeave = () => {
			visibleRef.current = false
			el.style.opacity = '0'
		}

		const onMouseOver = (e: MouseEvent) => {
			const t = e.target as Element
			if (isClickable(t)) el.classList.add('app-cursor--active')
		}
		const onMouseOut = () => {
			el.classList.remove('app-cursor--active')
		}

		const onMouseDown = () => {
			// ripple
			const ripple = document.createElement('span')
			ripple.className = 'app-cursor__ripple'
			el.appendChild(ripple)
			setTimeout(() => ripple.remove(), 450)
		}

		const loop = () => {
			// smooth follow
			const k = 0.15
			lerpRef.current.x += (posRef.current.x - lerpRef.current.x) * k
			lerpRef.current.y += (posRef.current.y - lerpRef.current.y) * k
			el.style.transform = `translate3d(${lerpRef.current.x}px, ${lerpRef.current.y}px, 0)`
			rafRef.current = requestAnimationFrame(loop)
		}
		rafRef.current = requestAnimationFrame(loop)

		document.addEventListener('mousemove', onMouseMove, { passive: true })
		document.addEventListener('mouseenter', onMouseEnter, { passive: true })
		document.addEventListener('mouseleave', onMouseLeave, { passive: true })
		document.addEventListener('mouseover', onMouseOver, { passive: true })
		document.addEventListener('mouseout', onMouseOut, { passive: true })
		document.addEventListener('mousedown', onMouseDown, { passive: true })

		return () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current)
			if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current)
			document.removeEventListener('mousemove', onMouseMove)
			document.removeEventListener('mouseenter', onMouseEnter)
			document.removeEventListener('mouseleave', onMouseLeave)
			document.removeEventListener('mouseover', onMouseOver)
			document.removeEventListener('mouseout', onMouseOut)
			document.removeEventListener('mousedown', onMouseDown)
			el.remove()
		}
	}, [])

	return null
}