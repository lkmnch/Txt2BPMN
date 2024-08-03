"use client"
import React, { FormEvent, useState } from "react"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Button } from "./ui/button"

function ProcessForm() {
	const [processName, setProcessName] = useState<string>("")
	const [processDescription, setProcessDescription] = useState<string>("")

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		try {
			e.preventDefault()
			const response = await fetch("/api/generate-bpmn", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ processDescription, processName }),
			})
			const data = await response.json()
			console.log(data.bpmnXml.message.content)
			//onGenerate(data.bpmnXml);
		} catch (error) {
			console.log("🚀 ~ handleSubmit ~ error:", error)
		}
	}
	return (
		<form className='flex flex-col gap-3' onSubmit={handleSubmit}>
			<div></div>
			<Input
				value={processName}
				onChange={(e) => setProcessName(e.target.value)}
				placeholder='Prozessname'
			/>
			<Textarea
				value={processDescription}
				onChange={(e) => setProcessDescription(e.target.value)}
				placeholder='Prozessbeschreibung eingeben'
				rows={15}
			/>
			<Button type='submit'>generieren</Button>
		</form>
	)
}

export default ProcessForm
