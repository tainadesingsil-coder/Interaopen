function clamp(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value))
}

function hexToRgb(hex: string) {
	const clean = hex.replace('#', '')
	const bigint = parseInt(clean, 16)
	const r = (bigint >> 16) & 255
	const g = (bigint >> 8) & 255
	const b = bigint & 255
	return { r, g, b }
}

function mix(hex1: string, hex2: string, weight: number) {
	const a = hexToRgb(hex1)
	const b = hexToRgb(hex2)
	const w = clamp(weight, 0, 1)
	const r = Math.round(a.r * (1 - w) + b.r * w)
	const g = Math.round(a.g * (1 - w) + b.g * w)
	const bl = Math.round(a.b * (1 - w) + b.b * w)
	return `#${[r, g, bl].map((x) => x.toString(16).padStart(2, '0')).join('')}`
}

function rgbToHex(r: number, g: number, b: number) {
	return `#${[r, g, b].map((x) => clamp(Math.round(x), 0, 255).toString(16).padStart(2, '0')).join('')}`
}

export async function applyBrandTheme(src: string) {
	try {
		const img = new Image()
		img.crossOrigin = 'anonymous'
		img.src = src

		await new Promise<void>((resolve, reject) => {
			img.onload = () => resolve()
			img.onerror = () => reject(new Error('Logo load error'))
		})

		const canvas = document.createElement('canvas')
		const ctx = canvas.getContext('2d')
		if (!ctx) return

		const size = 32
		canvas.width = size
		canvas.height = size
		ctx.drawImage(img, 0, 0, size, size)
		const { data } = ctx.getImageData(0, 0, size, size)

		let rSum = 0, gSum = 0, bSum = 0, count = 0
		for (let i = 0; i < data.length; i += 4) {
			const a = data[i + 3]
			if (a < 10) continue
			rSum += data[i]
			gSum += data[i + 1]
			bSum += data[i + 2]
			count++
		}
		if (count === 0) return

		const rAvg = rSum / count
		const gAvg = gSum / count
		const bAvg = bSum / count
		const primaryHex = rgbToHex(rAvg, gAvg, bAvg)
		const luminance = 0.2126 * rAvg + 0.7152 * gAvg + 0.0722 * bAvg
		const isDark = luminance < 140

		const contrast = isDark ? '#FFFFFF' : '#000000'
		const bgFrom = mix('#000000', primaryHex, 0.2)
		const bgTo = mix('#121212', primaryHex, 0.35)
		const ring = `rgba(${Math.round(rAvg)}, ${Math.round(gAvg)}, ${Math.round(bAvg)}, 0.4)`

		const root = document.documentElement
		root.style.setProperty('--brand-primary', primaryHex)
		root.style.setProperty('--brand-contrast', contrast)
		root.style.setProperty('--brand-bg-from', bgFrom)
		root.style.setProperty('--brand-bg-to', bgTo)
		root.style.setProperty('--brand-ring', ring)
	} catch (e) {
		// Silent fail; fall back to defaults
	}
}