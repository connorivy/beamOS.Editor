import * as THREE from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry, LineMaterial } from "three/examples/jsm/Addons.js";
import { BeamOsNode } from "./BeamOsNode";
import { IBeamOsMesh } from "../BeamOsMesh";

export interface NodeEventMap extends THREE.Object3DEventMap {
    moved: { value: THREE.Vector3 };
}

export class BeamOsElement1d extends Line2 implements IBeamOsMesh {
    public beamOsObjectType: string = "Element1d";
    private onNodeMovedFunc: (_event: any) => void;

    constructor(
        public beamOsId: string,
        private startNode: BeamOsNode,
        private endNode: BeamOsNode,
        lineMaterial: LineMaterial
    ) {
        super(new LineGeometry(), lineMaterial);

        this.onNodeMovedFunc = this.onNodeMoved.bind(this);

        this.setPositions();
        this.computeLineDistances();
        this.scale.set(1, 1, 1);

        startNode.addEventListener("moved", this.onNodeMovedFunc);
        endNode.addEventListener("moved", this.onNodeMovedFunc);
    }

    onNodeMoved(_event: any) {
        this.setPositions();
        this.geometry.attributes.position.needsUpdate = true;
    }

    setPositions() {
        this.geometry.setPositions([
            this.startNode.position.x,
            this.startNode.position.y,
            this.startNode.position.z,
            this.endNode.position.x,
            this.endNode.position.y,
            this.endNode.position.z,
        ]);
    }
}
