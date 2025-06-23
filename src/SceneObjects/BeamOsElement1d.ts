import * as THREE from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry, LineMaterial } from "three/examples/jsm/Addons.js";
import { BeamOsNode } from "./BeamOsNode";
import { IBeamOsMesh } from "../BeamOsMesh";
import { BeamOsObjectType } from "../EditorApi/EditorEventsApi";
import {
    BeamOsObjectTypes,
    objectTypeToString,
} from "../EditorApi/EditorApiAlphaExtensions";
import { BeamOsNodeBase } from "./BeamOsNodeBase";

export interface Element1dEventMap extends THREE.Object3DEventMap {
    moved: {};
}

export class BeamOsElement1d extends Line2 implements IBeamOsMesh {
    public static lineThickness: number = 0.1;
    public static beamOsObjectType: BeamOsObjectType =
        BeamOsObjectTypes.Element1d;
    public beamOsObjectType: BeamOsObjectType;
    private onNodeMovedFunc: (_event: any) => void;
    private previousMaterial: LineMaterial | undefined;
    public beamOsUniqueId: string;

    constructor(
        public beamOsId: number,
        public startNode: BeamOsNodeBase,
        public endNode: BeamOsNodeBase,
        lineMaterial: LineMaterial,
        objectType: BeamOsObjectType = BeamOsElement1d.beamOsObjectType
    ) {
        super(new LineGeometry(), lineMaterial);

        this.beamOsObjectType = objectType;
        this.beamOsUniqueId = objectTypeToString(objectType) + beamOsId;

        this.setPositions();
        this.computeLineDistances();
        this.scale.set(1, 1, 1);

        this.onNodeMovedFunc = this.onNodeMoved.bind(this);
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

    public ReplaceStartNode(newNode: BeamOsNode) {
        this.startNode.removeEventListener("moved", this.onNodeMovedFunc);
        this.startNode = newNode;
        this.startNode.addEventListener("moved", this.onNodeMovedFunc);
        this.setPositions();
    }
    public ReplaceEndNode(newNode: BeamOsNode) {
        this.endNode.removeEventListener("moved", this.onNodeMovedFunc);
        this.endNode = newNode;
        this.endNode.addEventListener("moved", this.onNodeMovedFunc);
        this.setPositions();
    }

    public GetPosition(): THREE.Vector3 {
        return BeamOsElement1d.GetMiddlePosition(
            this.startNode.position,
            this.endNode.position
        );
    }

    // Strongly-typed event methods for custom event map
    public addEventListener<K extends keyof Element1dEventMap>(
        type: K,
        listener: (event: Element1dEventMap[K]) => void
    ): void {
        super.addEventListener(type as string, listener as any);
    }

    public dispatchEvent<K extends keyof Element1dEventMap>(
        event: { type: K } & Element1dEventMap[K]
    ): void {
        super.dispatchEvent(event as any);
    }

    onNodeMoved(_event: any) {
        this.setPositions();
        this.dispatchEvent({ type: "moved" });
    }

    setPositions() {
        let startNodeLocation = this.startNode.GetPosition();
        let endNodeLocation = this.endNode.GetPosition();
        this.geometry.setPositions([
            startNodeLocation.x,
            startNodeLocation.y,
            startNodeLocation.z,
            endNodeLocation.x,
            endNodeLocation.y,
            endNodeLocation.z,
        ]);
        this.geometry.attributes.position.needsUpdate = true;
    }

    static GetMiddlePosition(
        start: THREE.Vector3,
        end: THREE.Vector3
    ): THREE.Vector3 {
        let middleX = (start.x + end.x) / 2;
        let middleY = (start.y + end.y) / 2;
        let middleZ = (start.z + end.z) / 2;
        return new THREE.Vector3(middleX, middleY, middleZ);
    }
}

export class BeamOsElement1dProposal extends BeamOsElement1d {
    public static beamOsObjectType: BeamOsObjectType =
        BeamOsObjectTypes.Element1dProposal;
    constructor(
        public existingElementId: number | undefined,
        beamOsId: number,
        startNode: BeamOsNode,
        endNode: BeamOsNode,
        lineMaterial: LineMaterial
    ) {
        super(
            beamOsId,
            startNode,
            endNode,
            lineMaterial,
            BeamOsElement1dProposal.beamOsObjectType
        );
    }
}
