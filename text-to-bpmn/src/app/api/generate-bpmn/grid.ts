type cell = {
	cellId: number
	startpoint: [number, number]
	endpoint: [number, number]
}

const canvas_x_start = 0
const canvas_x_end = 1000

const canvas_y_start = 0
const canvas_y_end = 1000

const columns = 10
const rows = 10

const stepSize_x = canvas_x_end / columns
const stepSize_y = canvas_y_end / rows

//1-D Array of cells
let cellArray: cell[] = []
let id = 0
for (let y = 0; y < canvas_y_end; y += stepSize_y) {
	for (let x = 0; x < canvas_x_end; x += stepSize_x) {
		cellArray.push({
			cellId: id,
			startpoint: [x, y],
			endpoint: [x + stepSize_x, y + stepSize_y],
		})
		id++
	}
}

console.log(cellArray)
