# Txt2BPMN
This is a Tool to generate bpmn-diagrams from business process descriptions with the use of the OpenAI LLM gpt-4o-mini.

## Features:
1) Generate BPMN Diagrams
2) Edit Diagrams with bpmnjs Editor
3) Export Diagrams as SVG or as bpmn-file

## How to use the app with Docker:
1. Pull the image from GitHub Container Registry:
```
docker pull ghcr.io/lkmnch/text2bpmn:latest
```
2. Run the container and provide your OpenAI API key as an environment variable:
```
docker run -e OPENAI_API_KEY=your-api-key -p 3000:3000 ghcr.io/lkmnch/text2bpmn:latest
```
3. Access the app in your browser at http://localhost:3000.

4. Enter your business process description and generate your BPMN diagram.

## How it works:

1) Put in the Description of your Process
   
   ![image](https://github.com/user-attachments/assets/4be92db2-02f9-4412-8a6c-adc757d139b7)
   
3) The Description is send to the LLM as part of a Prompt which returns a JSON including the Events, Tasks, Gateways and Sequence Flows of the Process.
   
   ![image](https://github.com/user-attachments/assets/5e2533db-f64b-4de2-a2d1-8630923e9513)

5) The Process is then showen in the bpmnjs Editor, where you can refine the Diagram.
   
   ![image](https://github.com/user-attachments/assets/3084cb86-88ab-4725-88a9-51afb02f7ac4)

7) After editing the diagram you can export it.
   
   ![image](https://github.com/user-attachments/assets/d6cf2ff2-6387-4838-8883-27bd6fb10abf)


## Architecture:

![image](https://github.com/user-attachments/assets/e9dfad29-1dae-42dd-96ba-3ee8f408adce)

## Problems:
- Sometimes some Sequenceflows will not be generated from the LLM
- Export of Diagram doesn't include edits
