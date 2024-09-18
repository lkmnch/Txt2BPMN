import { json } from "stream/consumers"
import { create } from "xmlbuilder2"

export function jsonToBpmn(jsonProcess: process): string {
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

	// Start Event
	jsonProcess.start_events.forEach((start_event: start_event) => {
		const start_eventElement = bpmnProcess.ele("bpmn:startEvent", {
			id: start_event.id,
			name: start_event.name,
		})
		jsonProcess.sequence_flows.forEach((flow: any) => {
			if (flow.sourceRef === start_event.id) {
				start_eventElement.ele("bpmn:outgoing").txt(flow.id)
			}
			if (flow.targetRef === start_event.id) {
				start_eventElement.ele("bpmn:incoming").txt(flow.id)
			}
		})
	})

	// Tasks
	jsonProcess.tasks.forEach((task: any) => {
		const taskElement = bpmnProcess.ele("bpmn:task", {
			id: task.id,
			name: task.name,
		})
		jsonProcess.sequence_flows.forEach((flow: any) => {
			if (flow.sourceRef === task.id) {
				taskElement.ele("bpmn:outgoing").txt(flow.id)
			}
			if (flow.targetRef === task.id) {
				taskElement.ele("bpmn:incoming").txt(flow.id)
			}
		})
	})

	// Gateways
	jsonProcess.gateways.forEach((gateway: gateway) => {
		const gatewayElement = bpmnProcess.ele(`bpmn:${gateway.type}`, {
			id: gateway.id,
			name: gateway.name,
		})
		jsonProcess.sequence_flows.forEach((flow: any) => {
			if (flow.sourceRef === gateway.id) {
				gatewayElement.ele("bpmn:outgoing").txt(flow.id)
			}
			if (flow.targetRef === gateway.id) {
				gatewayElement.ele("bpmn:incoming").txt(flow.id)
			}
		})
	})

	// End Event
	jsonProcess.end_events.forEach((end_event: any) => {
		const end_eventElement = bpmnProcess.ele("bpmn:endEvent", {
			id: end_event.id,
			name: end_event.name,
		})
		jsonProcess.sequence_flows.forEach((flow: any) => {
			if (flow.sourceRef === end_event.id) {
				end_eventElement.ele("bpmn:outgoing").txt(flow.id)
			}
			if (flow.targetRef === end_event.id) {
				end_eventElement.ele("bpmn:incoming").txt(flow.id)
			}
		})
	})

	// Sequence Flows
	jsonProcess.sequence_flows &&
		jsonProcess.sequence_flows.forEach((flow: any) => {
			bpmnProcess.ele("bpmn:sequenceFlow", {
				id: flow.id,
				sourceRef: flow.sourceRef,
				targetRef: flow.targetRef,
				name: flow.name,
			})
		})

	return root.end({ prettyPrint: true })
}
