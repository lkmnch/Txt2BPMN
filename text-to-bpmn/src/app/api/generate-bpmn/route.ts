import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

import * as fs from "fs"
import { NextApiResponse } from "next"

import { jsonToBpmn } from "./jsonToBPMN"

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
			//When their is parallelism then check if you have to close a gateway that opened. Also when an gateway has more then two input flows then use a gateway before it, so that their can't be more than two input flows into one gateway. Also
			messages: [
				{
					role: "system",
					content: `give me the bpmn tasks, gateways and events for this process description.  Just give me gateways when they are needed, if the process does not need gateways do not give me them. Description: ${processDescription} - Return the JSON in this format, with out any additional description or context and do not annotate it that it is JSON: { tasks: { id: string; name: string }[], gateways: { id: string name: string type: string }[], start_events: { id: string; name: string }[], end_events: { id: string; name: string }[], sequence_flows: { id: string; sourceRef: string; targetRef: string }[]}`,
				},
			],
			model: "gpt-4o-mini",
		})
		// hier checks einbauen um zu schauen ob der process Teil korrekt ist
		console.log(completion.choices[0])
		const bpmnXml = jsonToBpmn(completion.choices[0]) // das ist bpmnXMLProcess

		// hier neue prompt zum generieren des bpmn diagramm layouts mit  bpmnXMLProcess
		// hier layoutXml teil an den anderen kleben
		fs.writeFileSync("public/process.bpmn", bpmnXml)

		console.log("BPMN XML file generated successfully.")
		return bpmnXml
	} else {
		return "No description"
	}
}
