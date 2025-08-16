import fs from 'node:fs'
import path from 'node:path'
import ImageTracer from 'imagetracerjs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const input = path.resolve(__dirname, '../public/brand-logo.jpg')
const output = path.resolve(__dirname, '../public/brand-logo.svg')

function run() {
	const data = fs.readFileSync(input)
	const svgString = ImageTracer.imagetosvg(data, {
		ltres: 1,
		qtres: 1,
		pathomit: 1,
		colorsampling: 2,
		numberofcolors: 8,
		mincolorratio: 0,
		colorquantcycles: 3,
		blurradius: 1,
		blurdelta: 5,
		desc: false,
		lcpr: 0,
		qcpr: 0,
		scale: 1,
		roundcoords: 1,
		viewbox: true,
		stroke: 0,
		strokewidth: 0,
		linefilter: false,
	})
	// Remove background by turning near-black shapes transparent
	const cleaned = svgString
		.replace(/fill="#000000"/g, 'fill="none"')
		.replace(/fill="#0{3,6}"/g, 'fill="none"')

	fs.writeFileSync(output, cleaned)
	console.log('SVG written to', output)
}

run()