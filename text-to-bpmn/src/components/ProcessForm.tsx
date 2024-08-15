"use client"
import React, { FormEvent, useState } from "react"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Button } from "./ui/button"
import { Loader2 } from "lucide-react"

function ProcessForm() {
	const [processName, setProcessName] = useState<string>("")
	const [processDescription, setProcessDescription] = useState<string>("")
	const [loading, setLoading] = useState<boolean>(false)

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		setLoading(true)
		try {
			e.preventDefault()
			const response = await fetch("/api/generate-bpmn", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ processDescription, processName }),
			})
			const data = await response.text()
			console.log(data)
		} catch (error) {
			console.log("🚀 ~ handleSubmit ~ error:", error)
		} finally {
			setLoading(false)
		}
	}
	return (
		<form
			name='processForm'
			className='flex flex-col gap-3'
			onSubmit={handleSubmit}>
			<Input
				name='processName'
				value={processName}
				onChange={(e) => setProcessName(e.target.value)}
				placeholder='Prozessname'
			/>
			<Textarea
				name='processDescription'
				value={processDescription}
				onChange={(e) => setProcessDescription(e.target.value)}
				placeholder='Prozessbeschreibung eingeben'
				rows={15}
			/>
			<Button name='submitButton' type='submit' disabled={loading}>
				{loading ? (
					<>
						<Loader2 className='mr-2 h-4 w-4 animate-spin' />
						Bitte warten{" "}
					</>
				) : (
					"generieren"
				)}
			</Button>
		</form>
	)
}

export default ProcessForm
