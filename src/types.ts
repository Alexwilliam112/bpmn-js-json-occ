export interface BPMNDI {
  plane_id?: string | null;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  isMarkerVisible?: boolean;
  isExpanded?: boolean;
  hasLabel?: boolean;
  waypoints?: { x: number; y: number }[];
}

export interface BPMNNode {
  ids: string;
  current_version: string;
  parent_id: string | null;
  type: string;
  name: string;
  metadata: Record<string, any>;
  di: BPMNDI;
}

export interface BPMNEdge {
  ids: string;
  current_version: string;
  parent_id: string | null;
  type: string;
  name: string;
  source_id: string | null;
  target_id: string | null;
  condition_expression?: string | null;
  metadata: Record<string, any>;
  di: BPMNDI;
}

export interface BPMNLane {
  ids: string;
  current_version: string;
  parent_id: string | null;
  lane_set_id: string;
  name: string;
  flowNodeRefs: string[];
  di: BPMNDI;
}

export interface EnrichedGraph {
  ids: string;
  current_version: string;
  name: string;
  process_id: string | null;
  underlying_process_id: string | null;
  underlying_process_name: string | null;
  is_collaboration?: boolean;
  nodes: Record<string, BPMNNode>;
  edges: Record<string, BPMNEdge>;
  lanes: Record<string, BPMNLane>;
}
