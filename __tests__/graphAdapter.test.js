import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from "@jest/globals";
import {
  transformXmlToJsonMap,
  transformJsonMapToXml,
} from "../src/graphAdapter";

const complexXML = `
<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" name="Main Workflow" isExecutable="true">
    <bpmn:laneSet id="LaneSet_12ix1kp">
      <bpmn:lane id="Lane_01kmae5" name="Sales Representative">
        <bpmn:flowNodeRef>Activity_12u3th8</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_03as67f" name="System Administrator" />
      <bpmn:lane id="Lane_12q3hlm" name="Warehouse Manager">
        <bpmn:flowNodeRef>StartEvent_1</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_00qsly6</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Activity_14kk3z8</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Activity_0gplavu</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Activity_1waijmg</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Event_0bwyaqw</bpmn:flowNodeRef>
      </bpmn:lane>
    </bpmn:laneSet>
    <bpmn:startEvent id="StartEvent_1">
      <bpmn:outgoing>Flow_0zntht2</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:exclusiveGateway id="Gateway_00qsly6">
      <bpmn:incoming>Flow_0zntht2</bpmn:incoming>
      <bpmn:outgoing>Flow_0ekxi7i</bpmn:outgoing>
      <bpmn:outgoing>Flow_0k7y2q3</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:task id="Activity_12u3th8" name="wkwkwkwk">
      <bpmn:incoming>Flow_0ekxi7i</bpmn:incoming>
    </bpmn:task>
    <bpmn:task id="Activity_14kk3z8" name="oke">
      <bpmn:incoming>Flow_0k7y2q3</bpmn:incoming>
      <bpmn:outgoing>Flow_1e8kjkq</bpmn:outgoing>
    </bpmn:task>
    <bpmn:subProcess id="Activity_1waijmg" name="this is sub process">
      <bpmn:incoming>Flow_1e8kjkq</bpmn:incoming>
      <bpmn:outgoing>Flow_0gshky4</bpmn:outgoing>
      <bpmn:outgoing>Flow_09lt0te</bpmn:outgoing>
      <bpmn:startEvent id="Event_13fae6f">
        <bpmn:outgoing>Flow_0niwbfb</bpmn:outgoing>
      </bpmn:startEvent>
      <bpmn:task id="Activity_1tlvpaz">
        <bpmn:incoming>Flow_0niwbfb</bpmn:incoming>
        <bpmn:outgoing>Flow_0k9vskx</bpmn:outgoing>
      </bpmn:task>
      <bpmn:exclusiveGateway id="Gateway_0ngw25x">
        <bpmn:incoming>Flow_0k9vskx</bpmn:incoming>
        <bpmn:outgoing>Flow_18nps87</bpmn:outgoing>
      </bpmn:exclusiveGateway>
      <bpmn:endEvent id="Event_1hdlzlb">
        <bpmn:incoming>Flow_18nps87</bpmn:incoming>
      </bpmn:endEvent>
      <bpmn:sequenceFlow id="Flow_0niwbfb" sourceRef="Event_13fae6f" targetRef="Activity_1tlvpaz" />
      <bpmn:sequenceFlow id="Flow_0k9vskx" sourceRef="Activity_1tlvpaz" targetRef="Gateway_0ngw25x" />
      <bpmn:sequenceFlow id="Flow_18nps87" sourceRef="Gateway_0ngw25x" targetRef="Event_1hdlzlb" />
      <bpmn:group id="Group_1bvqbao" />
      <bpmn:textAnnotation id="TextAnnotation_09zmie3">
        <bpmn:text>annote 2</bpmn:text>
      </bpmn:textAnnotation>
      <bpmn:association id="Association_0500gi0" associationDirection="None" sourceRef="Event_1hdlzlb" targetRef="TextAnnotation_09zmie3" />
    </bpmn:subProcess>
    <bpmn:endEvent id="Event_0bwyaqw">
      <bpmn:incoming>Flow_0gshky4</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:callActivity id="Activity_0gplavu">
      <bpmn:incoming>Flow_09lt0te</bpmn:incoming>
    </bpmn:callActivity>
    <bpmn:sequenceFlow id="Flow_0zntht2" sourceRef="StartEvent_1" targetRef="Gateway_00qsly6" />
    <bpmn:sequenceFlow id="Flow_0ekxi7i" sourceRef="Gateway_00qsly6" targetRef="Activity_12u3th8" />
    <bpmn:sequenceFlow id="Flow_0k7y2q3" sourceRef="Gateway_00qsly6" targetRef="Activity_14kk3z8" />
    <bpmn:sequenceFlow id="Flow_1e8kjkq" sourceRef="Activity_14kk3z8" targetRef="Activity_1waijmg" />
    <bpmn:sequenceFlow id="Flow_0gshky4" sourceRef="Activity_1waijmg" targetRef="Event_0bwyaqw" />
    <bpmn:sequenceFlow id="Flow_09lt0te" sourceRef="Activity_1waijmg" targetRef="Activity_0gplavu" />
  </bpmn:process>
  <bpmn:collaboration id="Collaboration_1xjcjnl" name="BPMN Document">
    <bpmn:participant id="Participant_01u6kcp" name="Corporate ERP" processRef="Process_1" />
    <bpmn:textAnnotation id="TextAnnotation_1caqhlc">
      <bpmn:text>annote1</bpmn:text>
    </bpmn:textAnnotation>
    <bpmn:group id="Group_100aymb" />
    <bpmn:association id="Association_16djkiq" associationDirection="None" sourceRef="Activity_12u3th8" targetRef="TextAnnotation_1caqhlc" />
  </bpmn:collaboration>
  <bpmndi:BPMNDiagram id="BPMNDiagram_Collaboration_1xjcjnl">
    <bpmndi:BPMNPlane id="BPMNPlane_Collaboration_1xjcjnl" bpmnElement="Collaboration_1xjcjnl">
      <bpmndi:BPMNShape id="Participant_01u6kcp_di" bpmnElement="Participant_01u6kcp" isHorizontal="true">
        <dc:Bounds x="112" y="20" width="858" height="440" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="TextAnnotation_1caqhlc_di" bpmnElement="TextAnnotation_1caqhlc">
        <dc:Bounds x="420" y="65" width="100" height="30" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Group_100aymb_di" bpmnElement="Group_100aymb">
        <dc:Bounds x="250" y="40" width="300" height="300" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="162" y="232" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_00qsly6_di" bpmnElement="Gateway_00qsly6" isMarkerVisible="true">
        <dc:Bounds x="265" y="225" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_12u3th8_di" bpmnElement="Activity_12u3th8">
        <dc:Bounds x="220" y="40" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_14kk3z8_di" bpmnElement="Activity_14kk3z8">
        <dc:Bounds x="380" y="210" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_1waijmg_di" bpmnElement="Activity_1waijmg">
        <dc:Bounds x="550" y="210" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_0bwyaqw_di" bpmnElement="Event_0bwyaqw">
        <dc:Bounds x="722" y="232" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_0gplavu_di" bpmnElement="Activity_0gplavu">
        <dc:Bounds x="770" y="300" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_01kmae5_di" bpmnElement="Lane_01kmae5" isHorizontal="true">
        <dc:Bounds x="142" y="20" width="828" height="97" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_03as67f_di" bpmnElement="Lane_03as67f" isHorizontal="true">
        <dc:Bounds x="142" y="117" width="828" height="97" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_12q3hlm_di" bpmnElement="Lane_12q3hlm" isHorizontal="true">
        <dc:Bounds x="142" y="214" width="828" height="246" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Association_16djkiq_di" bpmnElement="Association_16djkiq">
        <di:waypoint x="320" y="80" />
        <di:waypoint x="420" y="80" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0zntht2_di" bpmnElement="Flow_0zntht2">
        <di:waypoint x="198" y="250" />
        <di:waypoint x="265" y="250" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0ekxi7i_di" bpmnElement="Flow_0ekxi7i">
        <di:waypoint x="290" y="225" />
        <di:waypoint x="290" y="173" />
        <di:waypoint x="270" y="173" />
        <di:waypoint x="270" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0k7y2q3_di" bpmnElement="Flow_0k7y2q3">
        <di:waypoint x="315" y="250" />
        <di:waypoint x="380" y="250" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1e8kjkq_di" bpmnElement="Flow_1e8kjkq">
        <di:waypoint x="480" y="250" />
        <di:waypoint x="550" y="250" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0gshky4_di" bpmnElement="Flow_0gshky4">
        <di:waypoint x="650" y="250" />
        <di:waypoint x="722" y="250" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_09lt0te_di" bpmnElement="Flow_09lt0te">
        <di:waypoint x="650" y="250" />
        <di:waypoint x="690" y="250" />
        <di:waypoint x="690" y="340" />
        <di:waypoint x="770" y="340" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
  <bpmndi:BPMNDiagram id="BPMNDiagram_Activity_1waijmg">
    <bpmndi:BPMNPlane id="BPMNPlane_Activity_1waijmg" bpmnElement="Activity_1waijmg">
      <bpmndi:BPMNShape id="Event_13fae6f_di" bpmnElement="Event_13fae6f">
        <dc:Bounds x="202" y="132" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Group_1bvqbao_di" bpmnElement="Group_1bvqbao">
        <dc:Bounds x="170" y="0" width="300" height="300" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>
`;

const simpleXML = `
<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="Definitions_1">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:task id="Task_1" />
  </bpmn:process>
</bpmn:definitions>
`;

describe("BPMN Enterprise Architecture Pipeline", () => {
  let consoleWarnSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("transformXmlToJsonMap (Graph Walker)", () => {
    it("should correctly map a complex Collaboration XML to JSON", async () => {
      const jsonMap = await transformXmlToJsonMap(complexXML);

      expect(jsonMap.is_collaboration).toBe(true);
      expect(jsonMap.process_id).toBe("Collaboration_1xjcjnl");
      expect(jsonMap.underlying_process_id).toBe("Process_1");

      expect(jsonMap.nodes["Participant_01u6kcp"]).toBeDefined();
      expect(jsonMap.nodes["TextAnnotation_1caqhlc"].metadata.text).toBe(
        "annote1",
      );
      expect(jsonMap.nodes["Group_100aymb"]).toBeDefined();

      expect(jsonMap.nodes["Event_13fae6f"].parent_id).toBe("Activity_1waijmg");

      expect(jsonMap.lanes["Lane_01kmae5"]).toBeDefined();
      expect(jsonMap.lanes["Lane_01kmae5"].flowNodeRefs).toContain(
        "Activity_12u3th8",
      );
      expect(jsonMap.lanes["Lane_03as67f"].flowNodeRefs).toEqual([]);

      expect(jsonMap.edges["Association_16djkiq"].type).toBe(
        "bpmn:Association",
      );
      expect(
        jsonMap.edges["Association_16djkiq"].metadata.associationDirection,
      ).toBe("None");
      expect(jsonMap.edges["Flow_0zntht2"].source_id).toBe("StartEvent_1");

      expect(jsonMap.nodes["Participant_01u6kcp"].di.plane_id).toBe(
        "Collaboration_1xjcjnl",
      );
      expect(jsonMap.nodes["Group_1bvqbao"].di.plane_id).toBe(
        "Activity_1waijmg",
      );
    });

    it("should correctly map a simple Process XML to JSON without Collaboration", async () => {
      const jsonMap = await transformXmlToJsonMap(simpleXML);

      expect(jsonMap.is_collaboration).toBe(false);
      expect(jsonMap.process_id).toBe("Process_1");
      expect(jsonMap.nodes["Task_1"]).toBeDefined();
      expect(jsonMap.lanes).toEqual({});
    });

    it("should throw an error if no process or collaboration is found", async () => {
      const invalidXml = `<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="Definitions_1"></bpmn:definitions>`;
      await expect(transformXmlToJsonMap(invalidXml)).rejects.toThrow(
        "No valid root",
      );
    });
  });

  describe("transformJsonMapToXml (Two-Pass Builder)", () => {
    it("should successfully round-trip a complex Collaboration Map back to XML", async () => {
      const jsonMap = await transformXmlToJsonMap(complexXML);
      const generatedXML = await transformJsonMapToXml(jsonMap);

      expect(generatedXML).toContain(
        '<bpmn:collaboration id="Collaboration_1xjcjnl"',
      );
      expect(generatedXML).toContain(
        '<bpmn:participant id="Participant_01u6kcp"',
      );

      expect(generatedXML).toContain('<bpmn:laneSet id="LaneSet_');
      expect(generatedXML).toContain('<bpmn:lane id="Lane_01kmae5"');
      expect(generatedXML).toContain(
        "<bpmn:flowNodeRef>Activity_12u3th8</bpmn:flowNodeRef>",
      );

      expect(generatedXML).toContain(
        '<bpmn:textAnnotation id="TextAnnotation_1caqhlc"',
      );
      expect(generatedXML).toContain("<bpmn:text>annote1</bpmn:text>");
      expect(generatedXML).toContain('<bpmn:group id="Group_100aymb"');

      expect(generatedXML).toContain('associationDirection="None"');
      expect(generatedXML).toContain(
        'sourceRef="Activity_12u3th8" targetRef="TextAnnotation_1caqhlc"',
      );

      expect(generatedXML).toMatch(
        /<bpmndi:BPMNDiagram id="BPMNDiagram_Collaboration_1xjcjnl"[\s\S]*?<bpmndi:BPMNPlane/,
      );
      expect(generatedXML).toMatch(
        /<bpmndi:BPMNDiagram id="BPMNDiagram_Activity_1waijmg"[\s\S]*?<bpmndi:BPMNPlane/,
      );
    });

    it("should generate missing DI defaults dynamically to prevent viewer crashes", async () => {
      const missingDiJson = {
        ids: "Def_1",
        is_collaboration: true,
        process_id: "Collaboration_1",
        nodes: {
          Task_1: { ids: "Task_1", type: "bpmn:Task", parent_id: "Process_1" },
          Annot_1: { ids: "Annote_1", type: "bpmn:TextAnnotation" },
          Part_1: { ids: "Part_1", type: "bpmn:Participant" },
        },
        lanes: {
          Lane_1: { ids: "Lane_1" },
        },
      };

      const xml = await transformJsonMapToXml(missingDiJson);

      expect(xml).toContain('width="100" height="80"');
      expect(xml).toContain(
        'id="Part_1_di" bpmnElement="Part_1" isHorizontal="true"',
      );
      expect(xml).toContain(
        'id="Lane_1_di" bpmnElement="Lane_1" isHorizontal="true"',
      );
      expect(xml).toMatch(
        /<bpmndi:BPMNShape id="Annote_1_di"[\s\S]*?<bpmndi:BPMNLabel \/>/,
      );
    });

    it("should trigger Ghost Edge Firewall when associations or flows point to missing nodes", async () => {
      const ghostEdgeJson = {
        ids: "Def_1",
        nodes: { N1: { ids: "N1", type: "bpmn:Task" } },
        edges: {
          Ghost: {
            ids: "GhostFlow",
            type: "bpmn:SequenceFlow",
            source_id: "N1",
            target_id: "MISSING_NODE",
          },
        },
      };

      const xml = await transformJsonMapToXml(ghostEdgeJson);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Skipping Edge GhostFlow: Source or Target node missing (Ghost Edge).",
      );
      expect(xml).not.toContain('id="GhostFlow"');
    });

    it("should process default Association Directions", async () => {
      const associationJson = {
        nodes: {
          T1: { ids: "T1", type: "bpmn:Task" },
          A1: { ids: "A1", type: "bpmn:TextAnnotation" },
        },
        edges: {
          Assoc1: {
            ids: "Assoc1",
            type: "bpmn:Association",
            source_id: "T1",
            target_id: "A1",
          },
        },
      };

      const xml = await transformJsonMapToXml(associationJson);
      expect(xml).toContain('associationDirection="None"');
    });

    it("should silently bypass broken extension elements", async () => {
      const brokenExtensionJson = {
        nodes: {
          Task1: {
            ids: "Task1",
            type: "bpmn:Task",
            metadata: {
              "unknown:Extension": [{ someData: "fail" }],
            },
          },
        },
      };

      const xml = await transformJsonMapToXml(brokenExtensionJson);
      expect(xml).toContain('id="Task1"');
      expect(xml).not.toContain("unknown:Extension");
    });
  });
});
