"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet"

import { FolderDown } from "lucide-react"
import ProcessForm from "@/components/ProcessForm"
import { useState } from "react"
import BpmnCanvas from "@/components/BpmnCanvas"
import Image from "next/image"
import { Label } from "@/components/ui/label"
import BpmnModeler from "bpmn-js/lib/Modeler"

export default function Home() {
	const [bpmnXml, setBpmnXml] = useState<string>("")
	const [fileFormat, setFileFormat] = useState<string>("")
	const [diagramName, setDiagramName] = useState<string>("")
	const [modeler, setModeler] = useState<BpmnModeler<null>>()

	function downloadDiagram() {
		if (fileFormat === "xml") {
			downloadXml()
		}
		if (fileFormat === "svg") {
			downloadSvg()
		}
	}

	function downloadXml() {
		const element = document.createElement("a")
		const file = new Blob([bpmnXml], { type: "text/xml" })
		element.href = URL.createObjectURL(file)
		element.download = `${diagramName}.bpmn`
		document.body.appendChild(element) // Required for this to work in FireFox
		element.click()
	}

	async function downloadSvg() {
		if (modeler) {
			const { svg } = await modeler.saveSVG()
			const element = document.createElement("a")
			var encodedData = encodeURIComponent(svg)
			element.href = "data:application/bpmn20-xml;charset=UTF-8," + encodedData
			element.download = `${diagramName}.svg`
			document.body.appendChild(element) // Required for this to work in FireFox
			element.click()
		}
	}

	return (
		<>
			<header className=' top-0 bg-slate-100'>
				<div className='container p-2 flex justify-center items-baseline'>
					<h1 className='scroll-m-20 text-2xl font-bold tracking-tight lg:text-3xl'>
						Txt2BPMN
					</h1>
				</div>
			</header>
			<main className=' bg-slate-50 '>
				<div className='flex flex-col min-h-screen container pt-5'>
					<div className='flex-grow'>
						<ProcessForm setBpmnXml={setBpmnXml} />
						{bpmnXml ? (
							<>
								<BpmnCanvas
									bpmnXML={bpmnXml}
									setModeler={setModeler}></BpmnCanvas>
								<div className=' mt-4 flex gap-2 justify-end'>
									<Sheet>
										<SheetTrigger asChild>
											<Button className=' font-medium text-xl'>
												{" "}
												<FolderDown className='mr-2' /> Export
											</Button>
										</SheetTrigger>
										<SheetContent>
											<SheetHeader>
												<SheetTitle>Download BPMN Diagram</SheetTitle>
											</SheetHeader>
											<div className='flex flex-col gap-4'>
												<div>
													<Label htmlFor='digramName'>Name</Label>
													<Input
														id='digramName'
														value={diagramName}
														onChange={(value) =>
															setDiagramName(value.target.value)
														}
													/>
												</div>
												<div>
													<Label htmlFor='fileFormat'>File Format</Label>
													<Select
														onValueChange={(value) => setFileFormat(value)}>
														<SelectTrigger id='fileFormat'>
															<SelectValue placeholder='File Format' />
														</SelectTrigger>
														<SelectContent position='popper'>
															<SelectItem value='xml'>XML</SelectItem>
															<SelectItem value='svg'>SVG</SelectItem>
														</SelectContent>
													</Select>
												</div>

												<Button onClick={() => downloadDiagram()}>
													Download
												</Button>
											</div>
										</SheetContent>
									</Sheet>
								</div>
							</>
						) : (
							<div className='flex justify-center items-center h-[400px]'>
								<div className='flex flex-col items-center gap-1'>
									<Image
										src='bpmnSVG.svg'
										alt='empty'
										width={200}
										height={200}
									/>

									<p className='text-2xl font-bold'>No BPMN diagram to show</p>
									<p className='text-lg'>Create a diagram above </p>
								</div>
							</div>
						)}
					</div>
				</div>
			</main>
			<footer className=' flex justify-center'>
				<p>Made by lkmnch</p>
			</footer>
		</>
	)
}
