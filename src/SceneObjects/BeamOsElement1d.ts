import * as THREE from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry, LineMaterial } from "three/examples/jsm/Addons.js";
import { BeamOsNode } from "./BeamOsNode";
import { IBeamOsMesh } from "../BeamOsMesh";

export interface NodeEventMap extends THREE.Object3DEventMap {
    moved: { value: THREE.Vector3 };
}

export class BeamOsElement1d extends Line2 implements IBeamOsMesh {
    public static lineThickness: number = 0.1;
    public beamOsObjectType: string = "Element1d";
    private onNodeMovedFunc: (_event: any) => void;
    private previousMaterial: LineMaterial | undefined;

    constructor(
        public beamOsId: string,
        public startNode: BeamOsNode,
        public endNode: BeamOsNode,
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

    public SetColorFilter(color: number, ghost: boolean) {
        this.previousMaterial = this.material;
        const copy = new LineMaterial({
            color: color,
            linewidth: this.material.linewidth,
            worldUnits: true,
            // transparent: true,
            // opacity: 0.2,
            depthTest: false,
        });
        if (ghost) {
            copy.opacity = 0.2;
            copy.transparent = true;
        }
        this.material = copy;
    }

    public RemoveColorFilter() {
        if (this.previousMaterial == undefined) {
            throw new Error(
                "Trying to unghost, but previous material is undefined"
            );
        }
        this.material = this.previousMaterial;
        this.previousMaterial = undefined;
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
