import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { zodResponseFormat } from "openai/helpers/zod"
import { jsonToBpmn } from "./jsonToBPMN"
import { layoutProcess } from "bpmn-auto-layout"
import { z } from "zod"

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
	const apiKey = process.env.OPENAI_API_KEY
	const openai = new OpenAI({ apiKey: apiKey })
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
					 Each element, except for start events, is the target of at least one sequence flow.
					 Add more gateways if needed.`,
				},
			],

			response_format: zodResponseFormat(bpmnProcess, "process"),
		})

		const jsonProcess: process = gptResponseProcess.choices[0].message
			.parsed as process
		console.log("🚀 ~ jsonProcess:", jsonProcess)

		const bpmnXML = jsonToBpmn(jsonProcess)

		const diagram = bpmnXML

		const layoutedDiagram = await layoutProcess(diagram)
		console.log("🚀 ~ layoutedDiagram:", layoutedDiagram)

		return layoutedDiagram
	} else {
		return "No description"
	}
}
