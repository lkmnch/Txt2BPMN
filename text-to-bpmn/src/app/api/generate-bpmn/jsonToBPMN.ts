import { create } from "xmlbuilder2"

type cell = {
	cellId: number
	startpoint: [number, number]
	endpoint: [number, number]
}

export function jsonToBpmn(jsonData: any): string {
	const canvas_x_end = 10000
	const canvas_y_end = 10000

	const columns = 100
	const rows = 100

	const stepSize_x = canvas_x_end / columns
	const stepSize_y = canvas_y_end / rows

	//create 1-D Array of cells with coordinates
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
	console.log("🚀 ~ jsonToBpmn ~ cellArray:", cellArray)

	const process: process = JSON.parse(jsonData.message.content)
	console.log(process)

	// Create the root element
	const root = create({ version: "1.0", encoding: "UTF-8" }).ele(
		"bpmn:definitions",
		{
			"xmlns:bpmn": "http://www.omg.org/spec/BPMN/20100524/MODEL",
			"xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
			"xmlns:bpmndi": "http://www.omg.org/spec/BPMN/20100524/DI",
			"xmlns:dc": "http://www.omg.org/spec/DD/20100524/DC",
			"xmlns:di": "http://www.omg.org/spec/DD/20100524/DI",
			id: "Definitions_1",
			targetNamespace: "http://bpmn.io/schema/bpmn",
		}
	)

	// Create the process element
	const bpmnProcess = root.ele("bpmn:process", {
		id: "Process_1",
		isExecutable: "false",
	})

	// Create BPMN Diagram
	const bpmnDiagram = root.ele("bpmndi:BPMNDiagram", { id: "BPMNDiagram_1" })
	const bpmnPlane = bpmnDiagram.ele("bpmndi:BPMNPlane", {
		id: "BPMNPlane_1",
		bpmnElement: "Process_1",
	})

	let usedCellsCounter = 0
	// Start Event
	process.start_events.forEach((start_event: start_event, index: number) => {
		// start boarder middle coordinates
		start_event.start_x = cellArray[usedCellsCounter].startpoint[0]
		start_event.start_y = (cellArray[usedCellsCounter].startpoint[1] + 36) / 2

		// end boarder middle coordinates
		start_event.end_x = cellArray[usedCellsCounter].startpoint[0] + 36
		start_event.end_y = (cellArray[usedCellsCounter].startpoint[1] + 36) / 2

		bpmnProcess.ele("bpmn:startEvent", {
			id: start_event.id,
			name: start_event.name,
		})
		bpmnPlane
			.ele("bpmndi:BPMNShape", {
				id: `Shape_${start_event.id}`,
				bpmnElement: start_event.id,
			})
			.ele("dc:Bounds", {
				x: cellArray[usedCellsCounter].startpoint[0],
				y: cellArray[usedCellsCounter].startpoint[1],
				width: 36,
				height: 36,
			})
		usedCellsCounter++
		console.log(
			"🚀 ~ process.start_events.forEach ~ usedCellsCounter:",
			usedCellsCounter
		)
	})

	// Tasks
	process.tasks.forEach((task: any) => {
		// start boarder middle coordinates
		task.start_x = cellArray[usedCellsCounter].startpoint[0]
		task.start_y = (cellArray[usedCellsCounter].startpoint[1] + 50) / 2

		// end boarder middle coordinates
		task.end_x = cellArray[usedCellsCounter].startpoint[0] + 80
		task.end_y = (cellArray[usedCellsCounter].startpoint[1] + 50) / 2

		bpmnProcess.ele("bpmn:task", {
			id: task.id,
			name: task.name,
		})
		bpmnPlane
			.ele("bpmndi:BPMNShape", {
				id: `Shape_${task.id}`,
				bpmnElement: task.id,
			})
			.ele("dc:Bounds", {
				x: cellArray[usedCellsCounter].startpoint[0],
				y: cellArray[usedCellsCounter].startpoint[1],
				width: 100,
				height: 80,
			})

		usedCellsCounter++
		console.log(
			"🚀 ~ process.tasks.forEach ~ usedCellsCounter:",
			usedCellsCounter
		)
	})

	// Gateways
	process.gateways.forEach((gateway: gateway) => {
		// start boarder middle coordinates
		gateway.start_x = cellArray[usedCellsCounter].endpoint[0]
		gateway.start_y = (cellArray[usedCellsCounter].endpoint[1] + 50) / 2

		// end boarder middle coordinates
		gateway.end_x = cellArray[usedCellsCounter].endpoint[0] + 50
		gateway.end_y = (cellArray[usedCellsCounter].endpoint[1] + 50) / 2

		bpmnProcess.ele(`bpmn:${gateway.type}Gateway`, {
			id: gateway.id,
			name: gateway.name,
		})
		bpmnPlane
			.ele("bpmndi:BPMNShape", {
				id: `Shape_${gateway.id}`,
				bpmnElement: gateway.id,
			})
			.ele("dc:Bounds", {
				x: cellArray[usedCellsCounter].startpoint[0],
				y: cellArray[usedCellsCounter].startpoint[1],
				width: 50,
				height: 50,
			})
		usedCellsCounter++
		console.log(
			"🚀 ~ process.gateways.forEach ~ usedCellsCounter:",
			usedCellsCounter
		)
	})

	// End Event
	process.end_events.forEach((end_event: any) => {
		//start boarder middle coordinates
		end_event.start_x = cellArray[usedCellsCounter].startpoint[0]
		end_event.start_y = (cellArray[usedCellsCounter].startpoint[1] + 36) / 2

		//end boarder middle coordinates
		end_event.end_x = cellArray[usedCellsCounter].startpoint[0] + 36
		end_event.end_y = (cellArray[usedCellsCounter].startpoint[1] + 36) / 2

		bpmnProcess.ele("bpmn:endEvent", {
			id: end_event.id,
			name: end_event.name,
		})
		bpmnPlane
			.ele("bpmndi:BPMNShape", {
				id: `Shape_${end_event.id}`,
				bpmnElement: end_event.id,
			})
			.ele("dc:Bounds", {
				x: cellArray[usedCellsCounter].startpoint[0],
				y: cellArray[usedCellsCounter].startpoint[1],
				width: 36,
				height: 36,
			})
		usedCellsCounter++
		console.log(
			"🚀 ~ process.end_events.forEach ~ usedCellsCounter:",
			usedCellsCounter
		)
	})

	// Sequence Flows
	process.sequence_flows.forEach((flow: any) => {
		const sequenceFlow = bpmnProcess.ele("bpmn:sequenceFlow", {
			id: `Flow_${flow.sourceRef}_${flow.targetRef}`,
			sourceRef: flow.sourceRef,
			targetRef: flow.targetRef,
		})
		/* bpmnPlane
			.ele("bpmndi:BPMNEdge", {
				id: `Edge_${flow.sourceRef}_${flow.targetRef}`,
				bpmnElement: `Flow_${flow.sourceRef}_${flow.targetRef}`,
			})
			.ele("di:waypoint", findElementBySourceRef(process, flow.sourceRef))
			.up() // Start point
			.ele("di:waypoint", findElementByTargetRef(process, flow.targetRef)) // End point

		if (flow.condition) {
			sequenceFlow
				.ele("bpmn:conditionExpression", {
					"xsi:type": "bpmn:tFormalExpression",
				})
				.txt(flow.condition)
		} */
	})

	return root.end({ prettyPrint: true })
}

function findElementBySourceRef(
	process: process,
	sourceRef: string
): { x: number; y: number } {
	// Search in tasks
	for (let task of process.tasks) {
		if (task.id === sourceRef) {
			return { x: task.end_x, y: task.end_y }
		}
	}

	// Search in gateways
	for (let gateway of process.gateways) {
		if (gateway.id === sourceRef) {
			return { x: gateway.end_x, y: gateway.end_y }
		}
	}

	// Search in start_events
	for (let startEvent of process.start_events) {
		if (startEvent.id === sourceRef) {
			return { x: startEvent.end_x, y: startEvent.end_y }
		}
	}

	// Search in end_events
	for (let endEvent of process.end_events) {
		if (endEvent.id === sourceRef) {
			return { x: endEvent.end_x, y: endEvent.end_y }
		}
	}

	// If not found, return null or undefined
	return { x: 0, y: 0 }
}

function findElementByTargetRef(
	process: process,
	targetRef: string
): { x: number; y: number } {
	// Search in tasks
	for (let task of process.tasks) {
		if (task.id === targetRef) {
			return { x: task.start_x, y: task.start_y }
		}
	}

	// Search in gateways
	for (let gateway of process.gateways) {
		if (gateway.id === targetRef) {
			return { x: gateway.start_x, y: gateway.start_y }
		}
	}

	// Search in start_events
	for (let startEvent of process.start_events) {
		if (startEvent.id === targetRef) {
			return { x: startEvent.start_x, y: startEvent.start_y }
		}
	}

	// Search in end_events
	for (let endEvent of process.end_events) {
		if (endEvent.id === targetRef) {
			return { x: endEvent.start_x, y: endEvent.start_y }
		}
	}

	// If not found, return null or undefined
	return { x: 0, y: 0 }
}
