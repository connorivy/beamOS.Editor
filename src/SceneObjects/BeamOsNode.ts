import * as THREE from "three";
import { BeamOsMesh } from "../BeamOsMesh";
import { Restraint } from "../EditorApi/EditorApiAlpha";
import {
    BeamOsObjectTypes,
    RestraintContractUtils,
    RestraintType,
} from "../EditorApi/EditorApiAlphaExtensions";
import { BeamOsObjectType } from "../EditorApi/EditorEventsApi";

export interface NodeEventMap extends THREE.Object3DEventMap {
    moved: {};
}

export class BeamOsNode extends BeamOsMesh<
    THREE.BufferGeometry,
    THREE.Material,
    NodeEventMap
> {
    public static beamOsObjectType: BeamOsObjectType = BeamOsObjectTypes.Node;
    // public beamOsObjectType: string = BeamOsNode.beamOsObjectType;
    private static nodeHex: number = 0x00ff00;
    public static nodeRadius: number = 0.1;

    private _restraint: Restraint;

    constructor(
        beamOsid: number,
        public xCoordinate: number,
        public yCoordinate: number,
        public zCoordinate: number,
        restraint: Restraint,
        yAxisUp: boolean,
        objectType: BeamOsObjectType = BeamOsNode.beamOsObjectType
    ) {
        let restraintType = RestraintContractUtils.GetRestraintType(restraint);
        super(
            beamOsid,
            objectType,
            BeamOsNode.GetGeometry(restraintType),
            new THREE.MeshLambertMaterial({ color: BeamOsNode.nodeHex })
        );
        this._restraint = restraint;
        this.setMeshPositionFromCoordinates();

        // GetGeometry is assuming a yAxis is up (three js conventions).
        // Must rotate the geometry if that is the case
        if (!yAxisUp) {
            this.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
        }
    }

    set restraint(value) {
        this._restraint = value;
        this.updateGeometryFromRestraint();
    }

    get restraint() {
        return this._restraint;
    }

    public setMeshPositionFromCoordinates() {
        this.position.set(this.xCoordinate, this.yCoordinate, this.zCoordinate);
        this.geometry.attributes.position.needsUpdate = true;
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

    // Add this method to your BeamOsNode class
    updateGeometryFromRestraint() {
        // Dispose of the old geometry to prevent memory leaks
        if (this.geometry) {
            this.geometry.dispose();
        }

        let restraintType = RestraintContractUtils.GetRestraintType(
            this.restraint
        );
        this.geometry = BeamOsNode.GetGeometry(restraintType);

        // Update the mesh
        this.geometry.attributes.position.needsUpdate = true;
    }
}

export class BeamOsNodeProposal extends BeamOsNode {
    // public static beamOsObjectType: BeamOsObjectType =
    //     BeamOsObjectTypes.NodeProposal;
    constructor(
        public existingNodeId: number | undefined,
        beamOsid: number,
        xCoordinate: number,
        yCoordinate: number,
        zCoordinate: number,
        restraint: Restraint,
        yAxisUp: boolean
    ) {
        super(
            beamOsid,
            xCoordinate,
            yCoordinate,
            zCoordinate,
            restraint,
            yAxisUp,
            BeamOsObjectTypes.NodeProposal
        );
    }

    public IsExisting() {
        return this.existingNodeId != undefined;
    }
}
