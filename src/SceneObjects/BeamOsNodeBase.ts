import * as THREE from "three";
import { BeamOsMesh } from "../BeamOsMesh";
import { BeamOsObjectType } from "../EditorApi/EditorEventsApi";
import { NodeEventMap } from "./BeamOsNode";

export abstract class BeamOsNodeBase extends BeamOsMesh<
    THREE.BufferGeometry,
    THREE.Material,
    NodeEventMap
> {
    constructor(
        public beamOsId: number,
        public beamOsObjectType: BeamOsObjectType,
        geometry?: THREE.BufferGeometry,
        material?: THREE.Material
    ) {
        super(beamOsId, beamOsObjectType, geometry, material);
    }

    abstract GetPosition(): THREE.Vector3;
}
