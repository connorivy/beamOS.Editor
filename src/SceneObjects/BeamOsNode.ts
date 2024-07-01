import * as THREE from "three";
import { BeamOsMesh } from "../BeamOsMesh";

export interface NodeEventMap extends THREE.Object3DEventMap {
    moved: {};
}

export class BeamOsNode extends BeamOsMesh<
    THREE.SphereGeometry,
    THREE.MeshStandardMaterial,
    NodeEventMap
> {
    constructor(
        public beamOsId: string,
        xCoordinate: number,
        yCoordinate: number,
        zCoordinate: number
    ) {
        super(
            beamOsId,
            new THREE.SphereGeometry(0.1),
            new THREE.MeshStandardMaterial()
        );
        this.position.set(xCoordinate, yCoordinate, zCoordinate);
    }

    public firePositionChangedEvent() {
        this.dispatchEvent({ type: "moved" });
    }
}
