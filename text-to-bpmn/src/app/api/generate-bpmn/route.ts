import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { zodResponseFormat } from "openai/helpers/zod"
import * as fs from "fs"
import { NextApiResponse } from "next"

import { jsonToBpmn } from "./jsonToBPMN"

//import { DOMParser, XMLSerializer } from "xmldom"
//const parser = new DOMParser()
import { z } from "zod"

const openai = new OpenAI()

const bpmnProcess = z.object({
	tasks: z.array(z.object({ id: z.string(), name: z.string() })),
	gateways: z.array(
		z.object({
			id: z.string(),
			name: z.string(),
			type: z.enum([
				"exclusiveGateway",
				"parallelGateway",
				"inclusiveGateway",
				"complexGateway",
				"eventBasedGateway",
			]),
		})
	),
	start_events: z.array(
		z.object({
			id: z.string(),
			name: z.string(),
		})
	),
	end_events: z.array(z.object({ id: z.string(), name: z.string() })),
	sequence_flows: z.array(
		z.object({
			id: z.string(),
			sourceRef: z.string(),
			targetRef: z.string(),
			name: z.string(),
		})
	),
})

/* const bpmnLayout = z.object({
	shapes: z.array(
		z.object({
			id: z.string(),
			bpmnElement: z.string(),
			bounds: z.object({
				x: z.number(),
				y: z.number(),
				width: z.number(),
				height: z.number(),
			}),
		})
	),
	edges: z.array(
		z.object({
			id: z.string(),
			bpmnElement: z.string(),
			waypoints: z.array(
				z.object({
					x: z.number(),
					y: z.number(),
				})
			),
		})
	),
}) */

const bpmnShapesT = z.object({
	shapes: z.array(
		z.object({
			id: z.string(),
			bpmnElement: z.string(),
			bounds: z.object({
				x: z.number(),
				y: z.number(),
				width: z.number(),
				height: z.number(),
			}),
		})
	),
})
const bpmnEdgesT = z.object({
	edges: z.array(
		z.object({
			id: z.string(),
			bpmnElement: z.string(),
			waypoints: z.array(
				z.object({
					x: z.number(),
					y: z.number(),
				})
			),
		})
	),
})

export async function POST(request: NextRequest) {
	const { processDescription, processName } = await request.json()

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
		const gptResponseProcess = await openai.beta.chat.completions.parse({
			model: "gpt-4o-mini-2024-07-18",
			//When their is parallelism then check if you have to close a gateway that opened. Also when an gateway has more then two input flows then use a gateway before it, so that their can't be more than two input flows into one gateway. Also
			messages: [
				{
					role: "user",
					content: `give me the bpmn elements for this process description. Create unique ids for every element with a prefix with this pattern: For Tasks:"task_{integer}", For Gateways:"gateway_{integer}", For Start Events:"start_{integer}", For End Events:"end_{integer}", For Sequence Flows:"flow_{integer}". Description: ${processDescription} `,
				},
			],

			response_format: zodResponseFormat(bpmnProcess, "process"),
		})

		const jsonProcess: process = gptResponseProcess.choices[0].message
			.parsed as process

		const tasks = jsonProcess.tasks
		console.log("L125:🚀 ~ tasks:", JSON.stringify(tasks))
		const gateways = jsonProcess.gateways
		console.log("L127:🚀 ~ gateways:", JSON.stringify(gateways))
		const start_events = jsonProcess.start_events
		console.log("L129:🚀 ~ start_events:", JSON.stringify(start_events))
		const end_events = jsonProcess.end_events
		console.log("L131:🚀 ~ end_events:", JSON.stringify(end_events))
		const sequence_flows = jsonProcess.sequence_flows
		console.log("L141:🚀 ~ sequence_flows:", JSON.stringify(sequence_flows))

		const gptResponseTaskShapes = await openai.beta.chat.completions.parse({
			model: "gpt-4o-mini-2024-07-18",
			messages: [
				{
					role: "user",
					content: `go over each bpmn task in this json: ${tasks}, remember precisely each id and generate for each task a bpmn shape. Generate the coordinates so the diagram is arranged from left to right with a main branch and subbranches as necessary. Ensure each shape's ID starts with "shape_". Reference the task IDs accurately from the task json, where IDs follow the pattern: "task_{id}". For context on the process, refer to the JSON here: ${jsonProcess} `,
				},
			],
			response_format: zodResponseFormat(bpmnShapesT, "bpmnShapes"),
		})
		const bpmnTaskShapes = gptResponseTaskShapes.choices[0].message.parsed
		console.log("L125:🚀 ~ bpmnTaskShapes:", JSON.stringify(bpmnTaskShapes))
		//const gptResponseGatewaysShapes = await openai.beta.chat.completions.parse({
		//	model: "gpt-4o-mini-2024-07-18",
		//	messages: [
		//		{
		//			role: "user",
		//			content: `go over each bpmn gateway in this json: ${gateways}, remember precisely each id and generate for each gateway a bpmn shape. Generate the coordinates so the diagram is arranged from left to right with a main branch and subbranches as necessary. Ensure each shape's ID starts with "shape_". Reference the gateway IDs accurately from the gateway json, where IDs follow the pattern: "gateway_{id}". For context on the process, refer to the JSON here: ${jsonProcess} `,
		//		},
		//	],
		//	response_format: zodResponseFormat(bpmnShapesT, "bpmnShapes"),
		//})
		//const bpmnGatewayShapes = gptResponseGatewaysShapes.choices[0].message.parsed
		//console.log("L125:🚀 ~ bpmnGatewayShapes:", JSON.stringify(bpmnGatewayShapes))
		//const gptResponseStartEventsShapes = await openai.beta.chat.completions.parse({
		//	model: "gpt-4o-mini-2024-07-18",
		//	messages: [
		//		{
		//			role: "user",
		//			content: `go over each bpmn start event in this json: ${start_events}, remember precisely each id and generate for each start event a bpmn shape. Generate the coordinates so the diagram is arranged from left to right with a main branch and subbranches as necessary. Ensure each shape's ID starts with "shape_". Reference the start event IDs accurately from the start event json, where IDs follow the pattern: "start_{id}". For context on the process, refer to the JSON here: ${jsonProcess} `,
		//		},
		//	],
		//	response_format: zodResponseFormat(bpmnShapesT, "bpmnShapes"),
		//})
		//const bpmnStartEventsShapes = gptResponseStartEventsShapes.choices[0].message.parsed
		//console.log("L125:🚀 ~ bpmnStartEventsShapes:", JSON.stringify(bpmnStartEventsShapes))
		//const gptResponseEndEventsShapes = await openai.beta.chat.completions.parse({
		//	model: "gpt-4o-mini-2024-07-18",
		//	messages: [
		//		{
		//			role: "user",
		//			content: `go over each bpmn end event in this json: ${end_events}, remember precisely each id and generate for each end event a bpmn shape. Generate the coordinates so the diagram is arranged from left to right with a main branch and subbranches as necessary. Ensure each shape's ID starts with "shape_". Reference the end event IDs accurately from the end event json, where IDs follow the pattern: "end_{id}". For context on the process, refer to the JSON here: ${jsonProcess} `,
		//		},
		//	],
		//	response_format: zodResponseFormat(bpmnShapesT, "bpmnShapes"),
		//})
		//const bpmnEndEventsShapes = gptResponseEndEventsShapes.choices[0].message.parsed
		//console.log("L125:🚀 ~ bpmnEndEventsShapes:", JSON.stringify(bpmnEndEventsShapes))
		// den anderen elementen task koordinaten als kontext geben

		const gptResponseEdges = await openai.beta.chat.completions.parse({
			model: "gpt-4o-mini-2024-07-18",
			messages: [
				{
					role: "user",
					content: `Give me for each bpmn sequence flow in this json: ${sequence_flows} a bpmn edge. Generate the waypoints in a way that it looks good and connects the bpmn elements. You can get the coordinates for the bpmn elements from here: ${jsonProcess} . Ensure each edge's ID starts with "edge_". Reference the sequence flow  IDs accurately from the JSON, where IDs follow the pattern: "flow_{id}". Add more waypoints to edges if it improves clarity. Ensure that all sequence flows from the JSON are included `,
				},
				{ role: "user", content: "did you forget anything?" },
			],
			response_format: zodResponseFormat(bpmnEdgesT, "bpmnEdges"),
		})
		const bpmnEdges = gptResponseEdges.choices[0].message.parsed
		//console.log("L139:🚀 ~ bpmnEdges:", JSON.stringify(bpmnEdges))

		//const bpmnXML = jsonToBpmn(jsonProcess, bpmnShapes)
		//zum loggen der generierten prozesse
		//fs.writeFileSync("public/process.bpmn", bpmnXML)

		return //bpmnXML
	} else {
		return "No description"
	}
}
