// @ts-ignore
import { BpmnModdle } from "bpmn-moddle";
import { EnrichedGraph, BPMNDI } from "./types.js";

function extractMetadata(element: any): Record<string, any> {
  const metadata: Record<string, any> = {};

  if (element.text !== undefined) {
    metadata.text = element.text;
  }
  if (element.associationDirection !== undefined) {
    metadata.associationDirection = element.associationDirection;
  }

  if (element.extensionElements && element.extensionElements.values) {
    element.extensionElements.values.forEach((ext: any) => {
      const extType = ext.$type;
      if (!metadata[extType]) metadata[extType] = [];
      const cleanExt = { ...ext };
      delete (cleanExt as any).$parent;
      delete (cleanExt as any).$type;
      metadata[extType].push(cleanExt);
    });
  }
  return metadata;
}

function buildDiLookupMap(diagrams: any[]): Record<string, BPMNDI> {
  const diMap: Record<string, BPMNDI> = {};
  if (!diagrams || diagrams.length === 0) return diMap;

  diagrams.forEach((diagram) => {
    const plane = diagram.plane;
    if (!plane || !plane.planeElement) return;

    const planeElementId = plane.bpmnElement ? plane.bpmnElement.id : null;

    plane.planeElement.forEach((diElem: any) => {
      if (!diElem.bpmnElement) return;
      const targetId = diElem.bpmnElement.id;

      if (diElem.$type === "bpmndi:BPMNShape") {
        diMap[targetId] = {
          plane_id: planeElementId,
          x: diElem.bounds.x,
          y: diElem.bounds.y,
          width: diElem.bounds.width,
          height: diElem.bounds.height,
        };

        if (diElem.isMarkerVisible !== undefined)
          diMap[targetId].isMarkerVisible = diElem.isMarkerVisible;
        if (diElem.isExpanded !== undefined)
          diMap[targetId].isExpanded = diElem.isExpanded;
        if (diElem.BPMNLabel || diElem.label) diMap[targetId].hasLabel = true;
      } else if (diElem.$type === "bpmndi:BPMNEdge") {
        diMap[targetId] = {
          plane_id: planeElementId,
          waypoints: (diElem.waypoint || []).map((wp: any) => ({
            x: wp.x,
            y: wp.y,
          })),
        };
      }
    });
  });

  return diMap;
}

export async function transformXmlToJsonMap(
  xmlString: string,
): Promise<EnrichedGraph> {
  const moddle = new BpmnModdle();
  try {
    const { rootElement: definitions } = await moddle.fromXML(xmlString);
    const enrichedGraph: EnrichedGraph = {
      ids: definitions.id || `Definitions_${Date.now()}`,
      current_version: "v1",
      name: definitions.name || "BPMN Document",
      process_id: null,
      underlying_process_id: null,
      underlying_process_name: null,
      nodes: {},
      edges: {},
      lanes: {},
    };

    const diMap = buildDiLookupMap(definitions.diagrams);
    const rootElements = definitions.rootElements || [];

    let rootProcess = rootElements.find(
      (el: any) => el.$type === "bpmn:Collaboration",
    );
    let isCollaboration = true;

    if (!rootProcess) {
      rootProcess = rootElements.find((el: any) => el.$type === "bpmn:Process");
      isCollaboration = false;
    }

    if (!rootProcess)
      throw new Error(
        "No valid root bpmn:Process or bpmn:Collaboration found.",
      );

    enrichedGraph.process_id = rootProcess.id;
    enrichedGraph.name = rootProcess.name || enrichedGraph.name;
    enrichedGraph.is_collaboration = isCollaboration;

    if (isCollaboration) {
      const participant =
        rootProcess.participants && rootProcess.participants[0];
      if (participant && participant.processRef) {
        enrichedGraph.underlying_process_id = participant.processRef.id;
        enrichedGraph.underlying_process_name = participant.processRef.name;
      }
    }

    const processFlowElements = (elements: any[], parentId: string | null) => {
      if (!elements) return;
      elements.forEach((element) => {
        const metadata = extractMetadata(element);
        const di = diMap[element.id] || {};

        if (
          element.$type === "bpmn:SequenceFlow" ||
          element.$type === "bpmn:MessageFlow" ||
          element.$type === "bpmn:Association"
        ) {
          enrichedGraph.edges[element.id] = {
            ids: element.id,
            current_version: "v1",
            parent_id: parentId,
            type: element.$type,
            name: element.name || "",
            source_id: element.sourceRef ? element.sourceRef.id : null,
            target_id: element.targetRef ? element.targetRef.id : null,
            condition_expression: element.conditionExpression
              ? element.conditionExpression.body
              : null,
            metadata,
            di,
          };
        } else {
          enrichedGraph.nodes[element.id] = {
            ids: element.id,
            current_version: "v1",
            parent_id: parentId,
            type: element.$type,
            name: element.name || "",
            metadata,
            di,
          };
          if (element.flowElements)
            processFlowElements(element.flowElements, element.id);
          if (element.artifacts)
            processFlowElements(element.artifacts, element.id);
        }
      });
    };

    const processLanes = (laneSets: any[], parentId: string | null) => {
      if (!laneSets) return;
      laneSets.forEach((laneSet: any) => {
        if (!laneSet.lanes) return;
        laneSet.lanes.forEach((lane: any) => {
          const di = diMap[lane.id] || {};
          const flowNodeRefIds = (lane.flowNodeRef || []).map(
            (ref: any) => ref.id,
          );

          enrichedGraph.lanes[lane.id] = {
            ids: lane.id,
            current_version: "v1",
            parent_id: parentId,
            lane_set_id: laneSet.id,
            name: lane.name || "",
            flowNodeRefs: flowNodeRefIds,
            di,
          };

          if (lane.childLaneSet) {
            processLanes([lane.childLaneSet], lane.id);
          }
        });
      });
    };

    if (isCollaboration) {
      if (rootProcess.participants) {
        processFlowElements(rootProcess.participants, rootProcess.id);
      }
      if (rootProcess.artifacts) {
        processFlowElements(rootProcess.artifacts, rootProcess.id);
      }
      rootElements
        .filter((el: any) => el.$type === "bpmn:Process")
        .forEach((proc: any) => {
          if (proc.flowElements)
            processFlowElements(proc.flowElements, rootProcess.id);
          if (proc.artifacts)
            processFlowElements(proc.artifacts, rootProcess.id);
          if (proc.laneSets) processLanes(proc.laneSets, rootProcess.id);
        });
    } else {
      if (rootProcess.flowElements)
        processFlowElements(rootProcess.flowElements, rootProcess.id);
      if (rootProcess.artifacts)
        processFlowElements(rootProcess.artifacts, rootProcess.id);
      if (rootProcess.laneSets)
        processLanes(rootProcess.laneSets, rootProcess.id);
    }

    return enrichedGraph;
  } catch (err) {
    console.error("Failed to parse BPMN XML:", err);
    throw err;
  }
}

function injectMetadata(
  element: any,
  metadata: Record<string, any>,
  moddle: any,
) {
  if (!metadata || Object.keys(metadata).length === 0) return;

  const extensionElements = moddle.create("bpmn:ExtensionElements", {
    values: [],
  });
  let hasExtensions = false;

  Object.entries(metadata).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((extObj) => {
        try {
          const extModdleObj = moddle.create(key, extObj);
          extensionElements.get("values").push(extModdleObj);
          hasExtensions = true;
        } catch (e) {}
      });
    }
  });

  if (hasExtensions) element.extensionElements = extensionElements;
}

export async function transformJsonMapToXml(
  jsonMap: EnrichedGraph,
): Promise<string> {
  const moddle = new BpmnModdle();
  const definitions = moddle.create("bpmn:Definitions", {
    id: jsonMap.ids || `Definitions_${Date.now()}`,
    targetNamespace: "http://bpmn.io/schema/bpmn",
  });

  const isCollaboration = jsonMap.is_collaboration === true;
  const processId =
    jsonMap.process_id || (isCollaboration ? "Collaboration_1" : "Process_1");
  const underlyingProcessId =
    jsonMap.underlying_process_id || `Process_${Date.now()}`;
  const underlyingProcessName =
    jsonMap.underlying_process_name || "Main Workflow";

  let rootSemanticElement: any;
  let defaultProcessForCollaboration: any;

  if (isCollaboration) {
    rootSemanticElement = moddle.create("bpmn:Collaboration", {
      id: processId,
      name: jsonMap.name || undefined,
    });
    defaultProcessForCollaboration = moddle.create("bpmn:Process", {
      id: underlyingProcessId,
      name: underlyingProcessName,
      isExecutable: true,
    });
    definitions.get("rootElements").push(defaultProcessForCollaboration);
  } else {
    rootSemanticElement = moddle.create("bpmn:Process", {
      id: processId,
      name: jsonMap.name || "BPMN Process",
      isExecutable: true,
    });
  }

  definitions.get("rootElements").push(rootSemanticElement);

  const elementRegistry: Record<string, any> = {
    [processId]: rootSemanticElement,
  };
  if (defaultProcessForCollaboration) {
    elementRegistry["_defaultProcess"] = defaultProcessForCollaboration;
  }

  const planes: Record<string, any> = {};

  function getOrCreatePlane(bpmnElementId: string) {
    if (!planes[bpmnElementId]) {
      const semanticRef = elementRegistry[bpmnElementId] || rootSemanticElement;
      const plane = moddle.create("bpmndi:BPMNPlane", {
        id: `BPMNPlane_${bpmnElementId}`,
        bpmnElement: semanticRef,
      });
      const diagram = moddle.create("bpmndi:BPMNDiagram", {
        id: `BPMNDiagram_${bpmnElementId}`,
        plane: plane,
      });
      definitions.get("diagrams").push(diagram);
      planes[bpmnElementId] = plane;
    }
    return planes[bpmnElementId];
  }

  getOrCreatePlane(processId);

  Object.values(jsonMap.nodes || {}).forEach((node) => {
    let props: any = { id: node.ids, name: node.name || undefined };

    if (node.type === "bpmn:Participant") {
      props.processRef = defaultProcessForCollaboration || undefined;
    }

    if (
      node.type === "bpmn:TextAnnotation" &&
      node.metadata?.text !== undefined
    ) {
      props.text = node.metadata.text;
    }

    const bpmnElement = moddle.create(node.type, props);
    injectMetadata(bpmnElement, node.metadata, moddle);

    if (
      !node.type.includes("Participant") &&
      !node.type.includes("Annotation") &&
      !node.type.includes("Group")
    ) {
      bpmnElement.incoming = [];
      bpmnElement.outgoing = [];
    }

    elementRegistry[node.ids] = bpmnElement;
  });

  Object.values(jsonMap.nodes || {}).forEach((node) => {
    const bpmnElement = elementRegistry[node.ids];
    const parentId = node.parent_id || processId;
    const parentElement = elementRegistry[parentId] || rootSemanticElement;

    if (node.type === "bpmn:Participant") {
      parentElement.get("participants")?.push(bpmnElement);
    } else if (
      node.type === "bpmn:TextAnnotation" ||
      node.type === "bpmn:Group"
    ) {
      parentElement.get("artifacts")?.push(bpmnElement);
    } else {
      if (parentElement.$type === "bpmn:Collaboration") {
        elementRegistry["_defaultProcess"]
          .get("flowElements")
          ?.push(bpmnElement);
      } else {
        parentElement.get("flowElements")?.push(bpmnElement);
      }
    }
  });

  const laneSetsMap: Record<string, any> = {};

  Object.values(jsonMap.lanes || {}).forEach((laneData) => {
    const laneProps = { id: laneData.ids, name: laneData.name || undefined };
    const bpmnLane = moddle.create("bpmn:Lane", laneProps);
    elementRegistry[laneData.ids] = bpmnLane;

    if (laneData.flowNodeRefs && laneData.flowNodeRefs.length > 0) {
      laneData.flowNodeRefs.forEach((refId) => {
        if (elementRegistry[refId]) {
          bpmnLane.get("flowNodeRef")?.push(elementRegistry[refId]);
        }
      });
    }

    const setId = laneData.lane_set_id || `LaneSet_${Date.now()}`;

    if (!laneSetsMap[setId]) {
      laneSetsMap[setId] = moddle.create("bpmn:LaneSet", { id: setId });
      if (isCollaboration) {
        elementRegistry["_defaultProcess"]
          .get("laneSets")
          ?.push(laneSetsMap[setId]);
      } else {
        rootSemanticElement.get("laneSets")?.push(laneSetsMap[setId]);
      }
    }

    laneSetsMap[setId].get("lanes")?.push(bpmnLane);
  });

  Object.values(jsonMap.nodes || {}).forEach((node) => {
    const bpmnElement = elementRegistry[node.ids];
    const di = node.di || {};

    const planeId = di.plane_id || node.parent_id || processId;
    const targetPlane = getOrCreatePlane(planeId);

    const bounds = moddle.create("dc:Bounds", {
      x: di.x ?? 0,
      y: di.y ?? 0,
      width: di.width ?? 100,
      height: di.height ?? 80,
    });

    const shapeProps: any = {
      id: `${node.ids}_di`,
      bpmnElement: bpmnElement,
      bounds: bounds,
    };

    if (node.type === "bpmn:Participant") {
      shapeProps.isHorizontal = true;
    }

    if (di.isMarkerVisible !== undefined)
      shapeProps.isMarkerVisible = di.isMarkerVisible;
    if (di.isExpanded !== undefined) shapeProps.isExpanded = di.isExpanded;

    const shape = moddle.create("bpmndi:BPMNShape", shapeProps);

    if (node.type === "bpmn:TextAnnotation" || di.hasLabel) {
      shape.label = moddle.create("bpmndi:BPMNLabel");
    }

    targetPlane.get("planeElement")?.push(shape);
  });

  Object.values(jsonMap.lanes || {}).forEach((laneData) => {
    const bpmnElement = elementRegistry[laneData.ids];
    const di = laneData.di || {};

    const planeId = di.plane_id || laneData.parent_id || processId;
    const targetPlane = getOrCreatePlane(planeId);

    const bounds = moddle.create("dc:Bounds", {
      x: di.x ?? 0,
      y: di.y ?? 0,
      width: di.width ?? 100,
      height: di.height ?? 80,
    });

    const shapeProps: any = {
      id: `${laneData.ids}_di`,
      bpmnElement: bpmnElement,
      bounds: bounds,
      isHorizontal: true,
    };

    const shape = moddle.create("bpmndi:BPMNShape", shapeProps);

    if (di.hasLabel) {
      shape.label = moddle.create("bpmndi:BPMNLabel");
    }

    targetPlane.get("planeElement")?.push(shape);
  });

  Object.values(jsonMap.edges || {}).forEach((edge) => {
    const sourceRef = elementRegistry[edge.source_id!];
    const targetRef = elementRegistry[edge.target_id!];

    if (!sourceRef || !targetRef) {
      console.warn(
        `Skipping Edge ${edge.ids}: Source or Target node missing (Ghost Edge).`,
      );
      return;
    }

    const seqFlowParams: any = {
      id: edge.ids,
      name: edge.name || undefined,
      sourceRef,
      targetRef,
    };

    if (
      edge.type === "bpmn:Association" &&
      edge.metadata?.associationDirection
    ) {
      seqFlowParams.associationDirection = edge.metadata.associationDirection;
    } else if (edge.type === "bpmn:Association") {
      seqFlowParams.associationDirection = "None";
    }

    if (edge.condition_expression && edge.type === "bpmn:SequenceFlow") {
      seqFlowParams.conditionExpression = moddle.create(
        "bpmn:FormalExpression",
        {
          body: edge.condition_expression,
        },
      );
    }

    const seqFlow = moddle.create(edge.type, seqFlowParams);
    injectMetadata(seqFlow, edge.metadata, moddle);
    elementRegistry[edge.ids] = seqFlow;

    const parentId = edge.parent_id || processId;
    const parentElement = elementRegistry[parentId] || rootSemanticElement;

    if (edge.type === "bpmn:MessageFlow") {
      parentElement.get("messageFlows")?.push(seqFlow);
    } else if (edge.type === "bpmn:Association") {
      if (parentElement.$type === "bpmn:Collaboration") {
        parentElement.get("artifacts")?.push(seqFlow);
      } else {
        parentElement.get("artifacts")?.push(seqFlow);
      }
    } else {
      if (parentElement.$type === "bpmn:Collaboration") {
        elementRegistry["_defaultProcess"].get("flowElements")?.push(seqFlow);
      } else {
        parentElement.get("flowElements")?.push(seqFlow);
      }
      sourceRef.get("outgoing")?.push(seqFlow);
      targetRef.get("incoming")?.push(seqFlow);
    }

    const di = edge.di || {};
    const planeId = di.plane_id || edge.parent_id || processId;
    const targetPlane = getOrCreatePlane(planeId);

    if (di.waypoints && di.waypoints.length > 0) {
      const waypoints = di.waypoints.map((wp: { x: number; y: number }) =>
        moddle.create("dc:Point", { x: wp.x, y: wp.y }),
      );
      const diEdge = moddle.create("bpmndi:BPMNEdge", {
        id: `${edge.ids}_di`,
        bpmnElement: seqFlow,
        waypoint: waypoints,
      });
      targetPlane.get("planeElement")?.push(diEdge);
    }
  });

  try {
    const { xml } = await moddle.toXML(definitions, { format: true });
    return xml;
  } catch (err) {
    throw err;
  }
}
