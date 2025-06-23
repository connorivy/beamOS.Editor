import * as THREE from "three";
import { IBeamOsMesh } from "../BeamOsMesh";
import { DeflectionDiagramResponse } from "../EditorApi/EditorApiAlpha";
import { BeamOsElement1d } from "./BeamOsElement1d";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { BeamOsObjectType } from "../EditorApi/EditorEventsApi";
import {
    BeamOsObjectTypes,
    objectTypeToString,
} from "../EditorApi/EditorApiAlphaExtensions";
import { BeamOsNodeBase } from "./BeamOsNodeBase";

export interface DiagramEventMap extends THREE.Object3DEventMap {
    moved: {};
}

export class BeamOsDiagramByPoints extends Line2 implements IBeamOsMesh {
    public static beamOsObjectType: BeamOsObjectType = BeamOsObjectTypes.Other;
    public beamOsObjectType: BeamOsObjectType =
        BeamOsDiagramByPoints.beamOsObjectType;
    public beamOsUniqueId: string;
    private previousMaterial: LineMaterial | undefined;
    // private static DiagramHex: number = 0xff00ff;

    constructor(
        public beamOsId: number,
        public startNode: BeamOsNodeBase,
        public endNode: BeamOsNodeBase,
        private diagramResponse: DeflectionDiagramResponse
    ) {
        super(
            new LineGeometry(),
            new LineMaterial({
                color: 0x0000ff,
                linewidth: 0.1,
                worldUnits: true,
                // transparent: true,
                // opacity: 0.2,
                depthTest: false,
            })
        );

        this.beamOsUniqueId =
            objectTypeToString(BeamOsElement1d.beamOsObjectType) + beamOsId;

        this.setPositions();
        this.computeLineDistances();
        this.scale.set(1, 1, 1);
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

    public GetPosition(): THREE.Vector3 {
        return this.startNode.GetPosition().clone();
    }

    private setPositions() {
        const point3dArr = new Array<number>();

        const worldStart = this.startNode.GetPosition();
        const worldEnd = this.endNode.GetPosition();

        for (let i = 0; i < this.diagramResponse.numSteps; i++) {
            let step = i / (this.diagramResponse.numSteps - 1);

            const result = new THREE.Vector3();
            result.lerpVectors(worldStart, worldEnd, step);

            point3dArr.push(
                result.x + this.diagramResponse.offsets[i * 3] * 10
            );
            point3dArr.push(
                result.y + this.diagramResponse.offsets[i * 3 + 1] * 10
            );
            point3dArr.push(
                result.z + this.diagramResponse.offsets[i * 3 + 2] * 10
            );
        }

        this.geometry.setPositions(point3dArr);
    }

    static GetColorFromUnity(unity: number): THREE.Color {
        const negativeColor = new THREE.Color(0, 0, 1);
        const neutralColor = new THREE.Color(1, 1, 1);
        const positiveColor = new THREE.Color(1, 0, 0);
        let result = new THREE.Color();

        if (unity > 0) {
            result.set(positiveColor);
        } else if (unity == 0) {
            result.set(neutralColor);
        } else {
            result.set(negativeColor);
        }

        return result;
    }
}
