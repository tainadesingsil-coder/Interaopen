const path = require('node:path')
const fs = require('node:fs')
const { promisify } = require('node:util')
const potrace = require('potrace')

const trace = promisify(potrace.trace)

async function main() {
	const input = path.resolve(__dirname, '../public/brand-logo.jpg')
	const output = path.resolve(__dirname, '../public/brand-logo.svg')
	const svg = await trace(input, {
		threshold: 180,
		turnPolicy: potrace.Potrace.TURNPOLICY_MINORITY,
		optCurve: true,
		color: '#FFFFFF',
		background: 'transparent',
	})
	fs.writeFileSync(output, svg)
	console.log('SVG written:', output)
}

main().catch((e) => {
	console.error(e)
	process.exit(1)
})