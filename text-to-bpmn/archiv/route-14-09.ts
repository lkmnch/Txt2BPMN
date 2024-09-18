import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { zodResponseFormat } from "openai/helpers/zod"
import * as fs from "fs"
import { NextApiResponse } from "next"

import { jsonToBpmn } from "./jsonToBPMN"
import { layoutProcess } from "bpmn-auto-layout"
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
			messages: [
				{
					role: "user",
					content: `Provide the BPMN elements for the following process description.
					 Assign unique IDs to each element using the following prefixes:
					 - Tasks: "task_{integer}"
					 - Gateways: "gateway_{integer}"
					 - Start Events: "start_{integer}"
					 - End Events: "end_{integer}"
					 - Sequence Flows: "flow_{integer}"

					 Description: <process_description>${processDescription}</process_description>

					 Only include sequence flow names when they originate from a gateway.
					 Ensure that each element, except for start events, is the target of at least one sequence flow.`,
				},
			],

			response_format: zodResponseFormat(bpmnProcess, "process"),
		})

		const jsonProcess: process = gptResponseProcess.choices[0].message
			.parsed as process
		console.log("🚀 ~ jsonProcess:", jsonProcess)

		const tasks = jsonProcess.tasks
		const gateways = jsonProcess.gateways
		const start_events = jsonProcess.start_events
		const end_events = jsonProcess.end_events
		const sequence_flows = jsonProcess.sequence_flows

		/* const gptResponseTaskShapes = await openai.beta.chat.completions.parse({
			model: "gpt-4o-mini-2024-07-18",
			messages: [
				{
					role: "user",
					content: `For context on the process, refer to the JSON here: <bpmn_process>${jsonProcess}</bpmn_process>. Go over each bpmn task in this json: <bpmn_tasks>${tasks}</bpmn_tasks>, remember precisely each id and generate for each task a bpmn shape. Before you generate the shapes think about generating bpmn shapes for every bpmn element in the <bpmn_process>, but in the end output just the tasks. The maximum number of shapes should be the maximum number of tasks in <bpmn_tasks>. Generate the coordinates so the diagram is arranged from left to right with a main branch and subbranches as necessary. Ensure each shape's ID starts with "shape_". Reference the task IDs accurately from the task json, where IDs follow the pattern: "task_{id}". Keep in mind that the tasks are part of a bigger diagram and should be arranged accordingly.  `,
				},
			],
			response_format: zodResponseFormat(bpmnShapesT, "bpmnShapes"),
		})
		const bpmnTaskShapes = gptResponseTaskShapes.choices[0].message.parsed

		const gptResponseGatewaysShapes = await openai.beta.chat.completions.parse({
			model: "gpt-4o-mini-2024-07-18",
			messages: [
				{
					role: "user",
					content: `go over each bpmn gateway in this json: <bpmn_gateways>${gateways}</bpmn_gateways>, remember precisely each id and generate for each gateway a bpmn shape. The maximum number of shapes should be the maximum number of gateways in <bpmn_gateways>. Allign the gateways to the coordinates of the bpmn tasks shapes: <bpmn_tasks_shapes>${bpmnTaskShapes}</bpmn_tasks_shapes>. Ensure each shape's ID starts with "shape_". Reference the gateway IDs accurately from the gateway json, where IDs follow the pattern: "gateway_{id}". For context on the process, refer to the JSON here: ${jsonProcess} `,
				},
			],
			response_format: zodResponseFormat(bpmnShapesT, "bpmnShapes"),
		})
		const bpmnGatewayShapes =
			gptResponseGatewaysShapes.choices[0].message.parsed

		const gptResponseStartEventsShapes =
			await openai.beta.chat.completions.parse({
				model: "gpt-4o-mini-2024-07-18",
				messages: [
					{
						role: "user",
						content: `go over each bpmn start event in this json: <bpmn_start_events>${start_events}</bpmn_start_events>, remember precisely each id and generate for each start event a bpmn shape. The maximum number of shapes should be the maximum number of start_events in <bpmn_start_events>. Allign the start_events to the coordinates of the bpmn tasks shapes: <bpmn_tasks_shapes>${bpmnTaskShapes}</bpmn_tasks_shapes>. Ensure each shape's ID starts with "shape_". Reference the start event IDs accurately from the start event json, where IDs follow the pattern: "start_{id}". For context on the process, refer to the JSON here: ${jsonProcess} `,
					},
				],
				response_format: zodResponseFormat(bpmnShapesT, "bpmnShapes"),
			})
		const bpmnStartEventsShapes =
			gptResponseStartEventsShapes.choices[0].message.parsed

		const gptResponseEndEventsShapes = await openai.beta.chat.completions.parse(
			{
				model: "gpt-4o-mini-2024-07-18",
				messages: [
					{
						role: "user",
						content: `go over each bpmn end event in this json: <bpmn_end_events>${end_events}</bpmn_end_events>, remember precisely each id and generate for each end event a bpmn shape. The maximum number of shapes should be the maximum number of end_events in <bpmn_end_events>. Allign the end_events to the coordinates of the bpmn tasks shapes: <bpmn_tasks_shapes>${bpmnTaskShapes}</bpmn_tasks_shapes>. Ensure each shape's ID starts with "shape_". Reference the end event IDs accurately from the end event json, where IDs follow the pattern: "end_{id}". For context on the process, refer to the JSON here: ${jsonProcess} `,
					},
				],
				response_format: zodResponseFormat(bpmnShapesT, "bpmnShapes"),
			}
		)
		const bpmnEndEventsShapes =
			gptResponseEndEventsShapes.choices[0].message.parsed

		// den anderen elementen task koordinaten als kontext geben

		const gptResponseEdges = await openai.beta.chat.completions.parse({
			model: "gpt-4o-mini-2024-07-18",
			messages: [
				{
					role: "user",
					content: `Give me for each bpmn sequence flow in this json: <bpmn_seqence_flows>${sequence_flows}</bpmn_seqence_flows> a bpmn edge. The maximum number of edges should be the maximum number of sequence_flows in <bpmn_sequence_flows>. Generate the waypoints in a way that it looks good and connects the bpmn elements. You can get the coordinates for the bpmn elements from here: ${jsonProcess} . Ensure each edge's ID starts with "edge_". Reference the sequence flow  IDs accurately from the JSON, where IDs follow the pattern: "flow_{id}". Add more waypoints to edges if it improves clarity. Ensure that all sequence flows from the JSON are included `,
				},
				{ role: "user", content: "did you forget anything?" },
			],
			response_format: zodResponseFormat(bpmnEdgesT, "bpmnEdges"),
		})
		const bpmnEdges = gptResponseEdges.choices[0].message.parsed

		let bpmnShapes = {}
		let bpmnShapesOverwrite: any = {}
		if (
			bpmnTaskShapes?.shapes &&
			bpmnGatewayShapes?.shapes &&
			bpmnStartEventsShapes?.shapes &&
			bpmnEndEventsShapes?.shapes &&
			bpmnEdges?.edges
		) {
			bpmnShapes = {
				shapes: [
					...bpmnTaskShapes.shapes,
					...bpmnGatewayShapes.shapes,
					...bpmnStartEventsShapes.shapes,
					...bpmnEndEventsShapes.shapes,
				],
				edges: bpmnEdges.edges,
			}
			console.log("🚀 ~ bpmnShapes:", bpmnShapes) */
		//this is a prompt to overwrite coordinates if they are not good

		//prompt to add more waypoints to edges if it improves clarity

		/* const gptResponseOverwrite = await openai.beta.chat.completions.parse({
				model: "gpt-4o-mini-2024-07-18",
				messages: [
					{
						role: "user",
						content: `The coordinates for the bpmn shapes and bpmn edges for this bpmn process <bpmn_process>${jsonProcess}</bpmn_process> are really bad and not good. Please overwrite the coordinates for the bpmn elements, that you can find in this bpmn diagram layout file <layout_file>${bpmnShapes}</layout_file>. Ensure that the bpmn elements are arranged in a way that it looks good and connects the bpmn elements. You can also add more waypoints to edges if it improves clarity. `,
					},
				],
				response_format: zodResponseFormat(bpmnShapesT, "bpmnShapes"),
			})
			//
			bpmnShapesOverwrite = gptResponseOverwrite.choices[0].message.parsed
			console.log("🚀 ~ bpmnShapesOverwrite:", bpmnShapesOverwrite) */

		const bpmnXML = jsonToBpmn(jsonProcess)

		const diagram = bpmnXML

		const layoutedDiagram = await layoutProcess(diagram)
		console.log("🚀 ~ layoutedDiagram:", layoutedDiagram)
		//zum loggen der generierten prozesse
		//fs.writeFileSync("public/process.bpmn", bpmnXML)

		return layoutedDiagram
	} else {
		return "No description"
	}
}
