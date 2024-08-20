"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Languages, CircleHelp, Ghost } from "lucide-react"
import ProcessForm from "@/components/ProcessForm"
import { useState } from "react"
import BpmnCanvas from "@/components/BpmnCanvas"

export default function Home() {
	const [bpmnXml, setBpmnXml] = useState<string>("")
	return (
		<main className='flex flex-col min-h-screen container'>
			<div className='flex-grow'>
				<header className='mt-5 mb-5 flex justify-between '>
					<h1 className='scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl'>
						txt-2-bpmn
					</h1>
					<div className='flex gap-2'>
						<Select>
							<SelectTrigger className='w-fit'>
								<SelectValue placeholder={<Languages />} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='german'>Deutsch</SelectItem>
								<SelectItem value='english'>English</SelectItem>
							</SelectContent>
						</Select>
						<Button variant='ghost'>
							<CircleHelp />
						</Button>
					</div>
				</header>
				<ProcessForm setBpmnXml={setBpmnXml} />

				<BpmnCanvas bpmnXML={bpmnXml} />
				<div className=' mt-4 flex gap-2 justify-end'>
					<Button>speichern</Button>
					<Button>exportieren</Button>
				</div>
			</div>
			<footer className=' flex justify-center'>
				<p>Made by lkmnch</p>
			</footer>
		</main>
	)
}
