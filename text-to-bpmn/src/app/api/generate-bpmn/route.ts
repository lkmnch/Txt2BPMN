import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI()

export async function POST(request: NextRequest) {
	const { processDescription, processName } = await request.json()

	// Replace this with your actual GPT API call
	const bpmnXml = await generateBpmnFromDescription(
		processDescription,
		processName
	)

	return NextResponse.json({ bpmnXml })
}

async function generateBpmnFromDescription(
	processDescription: string,
	processName: string
) {
	if (processDescription) {
		const completion = await openai.chat.completions.create({
			messages: [
				// {
				// 	role: "system",
				// 	content: `create a bpmn process xml file from this description and title, we dont need the diagramming stuff. Title: ${processName} Description: ${processDescription}`,
				// },
				{
					role: "system",
					content: `give me the bpmn tasks, gateways and events for this process description. When their is parallelism then check if you have to close a gateway that opened. Also when an gateway has more then two input flows then use a gatway before it, so that their can't be more than two input flows into one gateway. Description: ${processDescription} - Output it in JSON-Format`,
				},
			],
			model: "gpt-4o-mini",
		})
		console.log(completion.choices[0])
		return completion.choices[0] // Example BPMN XML
	} else {
		return "No description"
	}
}
