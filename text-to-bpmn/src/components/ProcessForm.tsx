"use client"
import React, {
	Dispatch,
	FormEvent,
	SetStateAction,
	useState,
	useEffect,
} from "react"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Button } from "./ui/button"
import { Loader2 } from "lucide-react"
import { Label } from "./ui/label"

type ProcessFormProps = {
	setBpmnXml: Dispatch<SetStateAction<string>>
}
function ProcessForm({ setBpmnXml }: ProcessFormProps) {
	const [processName, setProcessName] = useState<string>("")
	const [processDescription, setProcessDescription] = useState<string>("")
	const [isFormValid, setIsFormValid] = useState(false)
	const [loading, setLoading] = useState<boolean>(false)

	useEffect(() => {
		setIsFormValid(
			processName.trim() !== "" && processDescription.trim() !== ""
		)
	}, [processName, processDescription])

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		setBpmnXml("")
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
			setBpmnXml(data)
		} catch (error) {
			console.log("🚀 ~ handleSubmit ~ error:", error)
		} finally {
			setLoading(false)
		}
	}
	return (
		<form
			name='processForm'
			className='flex flex-col gap-2
		'
			onSubmit={handleSubmit}>
			<Label htmlFor='processName'>Process Name</Label>
			<Input
				className=' font-medium text-xl bg-white'
				name='processName'
				value={processName}
				onChange={(e) => setProcessName(e.target.value)}
			/>

			<Label htmlFor='processDescription'>Process Description</Label>
			<Textarea
				className=' font-medium text-xl bg-white'
				name='processDescription'
				value={processDescription}
				onChange={(e) => setProcessDescription(e.target.value)}
				rows={15}
			/>
			<div className='flex justify-end'>
				<Button
					className=' font-medium text-xl w-fit'
					name='submitButton'
					type='submit'
					disabled={!isFormValid || loading}>
					{loading ? (
						<>
							<Loader2 className='mr-2 h-4 w-4 animate-spin' />
							Please wait{" "}
						</>
					) : (
						"Generate"
					)}
				</Button>
			</div>
		</form>
	)
}

export default ProcessForm
