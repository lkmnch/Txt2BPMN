type process = {
	tasks: task[]
	gateways: gateway[]
	start_events: start_event[]
	end_events: end_event[]
	sequence_flows: sequence_flow[]
}

type start_event = {
	id: string
	name: string
}

type task = {
	id: string
	name: string
}

type gateway = {
	id: string
	name: string
	type: string
}

type end_event = {
	id: string
	name: string
}

type sequence_flow = {
	id: string
	sourceRef: string
	targetRef: string
}

declare module "xmldom"
