import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { create } from "xmlbuilder2"
import * as fs from "fs"
import { NextApiResponse } from "next"

const openai = new OpenAI()

export async function POST(request: NextRequest) {
	const { processDescription, processName } = await request.json()
	console.log("🚀 ~ POST ~ processDescription:", processDescription)

	const bpmnXml = await generateBpmnFromDescription(
		processDescription,
		processName
	)
	const response = new NextResponse(bpmnXml, {
		status: 200,
		headers: {
			"Content-Type": "application/xml",
		},
	})
	return response
}

async function generateBpmnFromDescription(
	processDescription: string,
	processName: string
) {
	if (processDescription) {
		const completion = await openai.chat.completions.create({
			messages: [
				{
					role: "system",
					content: `give me the bpmn tasks, gateways and events for this process description. When their is parallelism then check if you have to close a gateway that opened. Also when an gateway has more then two input flows then use a gatway before it, so that their can't be more than two input flows into one gateway. Description: ${processDescription} - Return the JSON in this format, with out any additional description or context and do not annotate it that it is JSON: { tasks: { id: string; name: string }[], gateways: { id: string name: string type: string }[], start_events: { id: string; name: string }[], end_events: { id: string; name: string }[], sequence_flows: { id: string; sourceRef: string; targetRef: string }[]}`,
				},
				// exaktes format der output json angeben
			],
			model: "gpt-4o-mini",
		})
		console.log(completion.choices[0])
		const bpmnXml = jsonToBpmn(completion.choices[0])
		fs.writeFileSync("public/process.bpmn", bpmnXml)

		console.log("BPMN XML file generated successfully.")
		return bpmnXml
	} else {
		return "No description"
	}
}

function jsonToBpmn(jsonData: any): string {
	const process = JSON.parse(jsonData.message.content)
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
		isExecutable: "true",
	})

	// Create BPMN Diagram
	const bpmnDiagram = root.ele("bpmndi:BPMNDiagram", { id: "BPMNDiagram_1" })
	const bpmnPlane = bpmnDiagram.ele("bpmndi:BPMNPlane", {
		id: "BPMNPlane_1",
		bpmnElement: "Process_1",
	})

	// Start Event
	process.start_events.forEach((start_event: any) => {
		bpmnProcess.ele("bpmn:startEvent", {
			id: start_event.id,
			name: start_event.name,
		})
		bpmnPlane
			.ele("bpmndi:BPMNShape", {
				id: `Shape_${start_event.id}`,
				bpmnElement: start_event.id,
			})
			.ele("dc:Bounds", { x: 100, y: 200, width: 36, height: 36 })
	})

	// Tasks
	process.tasks.forEach((task: any, index: number) => {
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
				x: 200 + index * 100,
				y: 200,
				width: 80,
				height: 50,
			})
	})

	// Gateways
	process.gateways.forEach((gateway: any, index: number) => {
		bpmnProcess.ele(`bpmn:${gateway.type}Gateway`, {
			id: gateway.id,
			name: gateway.name,
		})
		bpmnPlane
			.ele("bpmndi:BPMNShape", {
				id: `Shape_${gateway.id}`,
				bpmnElement: gateway.id,
			})
			.ele("dc:Bounds", { x: 300 + index * 100, y: 300, width: 50, height: 50 })
	})

	// End Event
	process.end_events.forEach((end_event: any) => {
		bpmnProcess.ele("bpmn:endEvent", {
			id: end_event.id,
			name: end_event.name,
		})
		bpmnPlane
			.ele("bpmndi:BPMNShape", {
				id: `Shape_${end_event.id}`,
				bpmnElement: end_event.id,
			})
			.ele("dc:Bounds", { x: 800, y: 200, width: 36, height: 36 })
	})

	// Sequence Flows
	process.sequence_flows.forEach((flow: any) => {
		const sequenceFlow = bpmnProcess.ele("bpmn:sequenceFlow", {
			id: `Flow_${flow.sourceRef}_${flow.targetRef}`,
			sourceRef: flow.sourceRef,
			targetRef: flow.targetRef,
		})
		bpmnPlane
			.ele("bpmndi:BPMNEdge", {
				id: `Edge_${flow.sourceRef}_${flow.targetRef}`,
				bpmnElement: `Flow_${flow.sourceRef}_${flow.targetRef}`,
			})
			.ele("di:waypoint", { x: 100, y: 100 })
			.up() // Start point
			.ele("di:waypoint", { x: 200, y: 200 }) // End point

		if (flow.condition) {
			sequenceFlow
				.ele("bpmn:conditionExpression", {
					"xsi:type": "bpmn:tFormalExpression",
				})
				.txt(flow.condition)
		}
	})

	return root.end({ prettyPrint: true })
}
