type process = {
	tasks: task[]
	gateways: gateway[]
	start_events: start_event[]
	end_events: end_event[]
	sequence_flows?: sequence_flow[]
}

type start_event = {
	id: string
	name: string
	// start_x?: number
	// start_y?: number
	// end_x?: number
	// end_y?: number
}

type task = {
	id: string
	name: string
	// start_x: number
	// start_y: number
	// end_x: number
	// end_y: number
}

type gateway = {
	id: string
	name: string
	type: string
	// start_x: number
	// start_y: number
	// end_x: number
	// end_y: number
}

type end_event = {
	id: string
	name: string
	// start_x: number
	// start_y: number
	// end_x: number
	// end_y: number
}

type sequence_flow = {
	id: string
	sourceRef: string
	targetRef: string
}

declare module "xmldom"
