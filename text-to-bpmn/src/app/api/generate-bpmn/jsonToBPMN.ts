import { json } from "stream/consumers"
import { create } from "xmlbuilder2"

export function jsonToBpmn(jsonProcess: process, jsonLayout: any): string {
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
	// Start Event
	jsonProcess.start_events.forEach((start_event: start_event) => {
		bpmnProcess.ele("bpmn:startEvent", {
			id: start_event.id,
			name: start_event.name,
		})
	})

	// Tasks
	jsonProcess.tasks.forEach((task: any) => {
		bpmnProcess.ele("bpmn:task", {
			id: task.id,
			name: task.name,
		})
	})

	// Gateways
	jsonProcess.gateways.forEach((gateway: gateway) => {
		bpmnProcess.ele(`bpmn:${gateway.type}`, {
			id: gateway.id,
			name: gateway.name,
		})
	})

	// End Event
	jsonProcess.end_events.forEach((end_event: any) => {
		bpmnProcess.ele("bpmn:endEvent", {
			id: end_event.id,
			name: end_event.name,
		})
	})

	// Sequence Flows
	jsonProcess.sequence_flows &&
		jsonProcess.sequence_flows.forEach((flow: any) => {
			bpmnProcess.ele("bpmn:sequenceFlow", {
				id: flow.id,
				sourceRef: flow.sourceRef,
				targetRef: flow.targetRef,
			})
		})
	jsonLayout.shapes.forEach((shape: any) => {
		bpmnPlane
			.ele("bpmndi:BPMNShape", {
				id: shape.id,
				bpmnElement: shape.bpmnElement,
			})
			.ele("dc:Bounds", {
				x: shape.bounds.x,
				y: shape.bounds.y,
				width: shape.bounds.width,
				height: shape.bounds.height,
			})
	})
	jsonLayout.edges.forEach((edge: any) => {
		const bpmnEdge = bpmnPlane.ele("bpmndi:BPMNEdge", {
			id: edge.id,
			bpmnElement: edge.bpmnElement,
		})
		edge.waypoints.forEach((waypoint: any) => {
			bpmnEdge.ele("di:waypoint", {
				x: waypoint.x,
				y: waypoint.y,
			})
		})
	})

	return root.end({ prettyPrint: true })
}
