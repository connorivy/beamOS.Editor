import * as THREE from "three";
import { BeamOsMesh } from "../BeamOsMesh";
import { RestraintResponse } from "../EditorApi/EditorApiAlpha";
import {
    RestraintResponseUtils,
    RestraintType,
} from "../EditorApi/EditorApiAlphaExtensions";

export interface NodeEventMap extends THREE.Object3DEventMap {
    moved: {};
}

export class BeamOsNode extends BeamOsMesh<
    THREE.BufferGeometry,
    THREE.Material,
    NodeEventMap
> {
    public beamOsObjectType: string = "Node";
    private static nodeHex: number = 0x00ff00;
    public static nodeRadius: number = 0.1;

    constructor(
        public beamOsId: string,
        xCoordinate: number,
        yCoordinate: number,
        zCoordinate: number,
        restraint: RestraintResponse
    ) {
        let restraintType = RestraintResponseUtils.GetRestraintType(restraint);
        super(
            beamOsId,
            BeamOsNode.GetGeometry(restraintType),
            new THREE.MeshLambertMaterial({ color: BeamOsNode.nodeHex })
        );
        this.position.set(xCoordinate, yCoordinate, zCoordinate);
    }

    public firePositionChangedEvent() {
        this.dispatchEvent({ type: "moved" });
    }

    static GetGeometry(restraint: RestraintType): THREE.BufferGeometry {
        if (restraint == RestraintType.Pinned) {
            return new THREE.ConeGeometry(0.1, 0.2);
        } else if (restraint == RestraintType.Fixed) {
            let boxSideLength = BeamOsNode.nodeRadius * 2;
            return new THREE.BoxGeometry(
                boxSideLength,
                boxSideLength,
                boxSideLength
            );
        } else {
            return new THREE.SphereGeometry(BeamOsNode.nodeRadius);
        }
    }
}
