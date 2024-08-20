"use client"
import React, { useEffect, useRef } from "react"
import BpmnViewer from "bpmn-js/lib/Viewer"

type BpmnCanvas = {
	bpmnXML: string
}

interface Canvas {
	zoom(level: string | number): void
	viewbox(): { x: number; y: number; width: number; height: number }
	addMarker(element: string, marker: string): void
	removeMarker(element: string, marker: string): void
	// Add other methods as needed
}

function BpmnCanvas({ bpmnXML }: BpmnCanvas) {
	const divRef = useRef<HTMLDivElement>(null)
	const viewerRef = useRef<BpmnViewer | null>(null)

	useEffect(() => {
		// create a modeler
		if (divRef.current) {
			const viewer = new BpmnViewer({ container: divRef.current })
			viewerRef.current = viewer

			if (bpmnXML.length !== 0) {
				const importDiagramm = async () => {
					console.log("BPMN XML:", bpmnXML) // Log the XML to check content
					// import diagram
					try {
						await viewer.importXML(bpmnXML)
						const canvas = viewer.get("canvas") as Canvas
						canvas.zoom("fit-viewport")
					} catch (err) {
						console.log("🚀 ~ importDiagramm ~ err:", err)
					}
				}
				importDiagramm()
			}
		}
		// Cleanup
		return () => {
			viewerRef.current?.destroy()
		}
	}, [bpmnXML])

	return (
		<div
			id='canvas'
			ref={divRef}
			className='h-96 bg-slate-400 rounded-lg mt-5 '
		/>
	)
}

export default BpmnCanvas
