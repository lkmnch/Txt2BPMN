const fs = require("fs")
const libxmljs = require("libxmljs2")

const xmlData = fs.readFileSync("test-diagramm.bpmn", "utf8")
const xsdData = fs.readFileSync("BPMN20.xsd", "utf8")
const bpmndiXsdData = fs.readFileSync("BPMNDI.xsd", "utf8")

// Parse XSDs
const xsdDoc = libxmljs.parseXml(xsdData)
const bpmndiXsdDoc = libxmljs.parseXml(bpmndiXsdData)

// Parse XML
const xmlDoc = libxmljs.parseXml(xmlData)

// Validate XML against XSD
const isValid = xmlDoc.validate(xsdDoc) && xmlDoc.validate(bpmndiXsdDoc)

if (isValid) {
	console.log("XML is valid against the XSD.")
} else {
	console.log("XML validation failed:")
	xmlDoc.validationErrors.forEach((error) => {
		console.log(`${error.line}: ${error.message}`)
	})
}
