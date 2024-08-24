var canvas_x_start = 0;
var canvas_x_end = 1000;
var canvas_y_start = 0;
var canvas_y_end = 1000;
var columns = 10;
var rows = 10;
var stepSize_x = canvas_x_end / columns;
var stepSize_y = canvas_y_end / rows;
//1-D Array of cells
var cellArray = [];
var id = 0;
for (var y = 0; y < canvas_y_end; y += stepSize_y) {
    for (var x = 0; x < canvas_x_end; x += stepSize_x) {
        cellArray.push({
            cellId: id,
            startpoint: [x, y],
            endpoint: [x + stepSize_x, y + stepSize_y],
        });
        id++;
    }
}
console.log(cellArray);
