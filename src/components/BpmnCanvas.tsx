"use client"
import React, { Dispatch, SetStateAction, useEffect, useRef } from "react"
import BpmnViewer from "bpmn-js/lib/Viewer"
import BpmnModeler from "bpmn-js/lib/Modeler"

import "bpmn-js/dist/assets/diagram-js.css"
import "bpmn-js/dist/assets/bpmn-js.css"

import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css"

type BpmnCanvas = {
	bpmnXML: string
	setDiagramAsSvg: Dispatch<SetStateAction<string | undefined>>
}

interface Canvas {
	zoom(level: string | number): void
	viewbox(): { x: number; y: number; width: number; height: number }
	addMarker(element: string, marker: string): void
	removeMarker(element: string, marker: string): void
	// Add other methods as needed
}

function BpmnCanvas({ bpmnXML, setDiagramAsSvg }: BpmnCanvas) {
	const divRef = useRef<HTMLDivElement>(null)
	const viewerRef = useRef<BpmnViewer | null>(null)

	useEffect(() => {
		// create a modeler
		if (divRef.current) {
			const modeler = new BpmnModeler({
				container: divRef.current,
				keyboard: {
					bindTo: window,
				},
			})
			viewerRef.current = modeler

			if (bpmnXML.length !== 0) {
				const importDiagramm = async () => {
					console.log("BPMN XML:", bpmnXML) // Log the XML to check content
					// import diagram
					try {
						await modeler.importXML(bpmnXML)
						const canvas = modeler.get("canvas") as Canvas
						canvas.zoom("fit-viewport")
						const { svg } = await modeler.saveSVG()
						setDiagramAsSvg(svg)
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
			className='h-[600px] bg-white rounded-lg mt-5 shadow-sm border border-input '></div>
	)
}

export default BpmnCanvas