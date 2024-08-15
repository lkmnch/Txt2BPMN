type process = {
	tasks: { id: string; name: string }[]
	gateways: {
		id: string
		name: string
		type: string
	}[]
	start_events: { id: string; name: string }[]
	end_events: { id: string; name: string }[]
	sequence_flows: { id: string; sourceRef: string; targetRef: string }[]
}
