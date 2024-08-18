import * as THREE from "three";
import { BeamOsMesh } from "../BeamOsMesh";
import { BufferGeometryUtils } from "three/examples/jsm/Addons.js";
import { BeamOsNode } from "./BeamOsNode";
import { Vector3 } from "../EditorApi/EditorApiAlpha";

export interface PointLoadEventMap extends THREE.Object3DEventMap {
    moved: {};
}

export class BeamOsPointLoad extends BeamOsMesh<
    THREE.BufferGeometry,
    THREE.Material,
    PointLoadEventMap
> {
    public beamOsObjectType: string = "PointLoad";
    private onNodeMovedFunc: (_event: any) => void;

    private static PointLoadHex: number = 0xe3963e;
    private static pointLoadConeRadius: number = 0.1;
    private static pointLoadConeHeight: number = 0.2;

    private static pointLoadCylinderRadius: number = 0.04;
    private static pointLoadCylinderHeight: number =
        this.pointLoadCylinderRadius * 10;

    public static pointLoadGeometry: THREE.BufferGeometry = this.GetGeometry();

    constructor(
        public beamOsId: string,
        private node: BeamOsNode,
        private direction: Vector3
    ) {
        super(
            beamOsId,
            BeamOsPointLoad.pointLoadGeometry,
            new THREE.MeshLambertMaterial({
                color: BeamOsPointLoad.PointLoadHex,
            })
        );

        this.onNodeMovedFunc = this.onNodeMoved.bind(this);
        this.setPositions();
        this.node.addEventListener("moved", this.onNodeMovedFunc);
    }

    static GetGeometry(): THREE.BufferGeometry {
        let coneGeometry = new THREE.ConeGeometry(
            this.pointLoadConeRadius,
            this.pointLoadConeHeight
        );
        let cylinderGeometry = new THREE.CylinderGeometry(
            this.pointLoadCylinderRadius,
            this.pointLoadCylinderRadius,
            this.pointLoadCylinderHeight
        );
        coneGeometry.rotateX(Math.PI);
        coneGeometry.translate(0, this.pointLoadConeHeight / 2, 0);
        cylinderGeometry.translate(
            0,
            this.pointLoadConeHeight + this.pointLoadCylinderHeight / 2,
            0
        );

        const merged = BufferGeometryUtils.mergeGeometries([
            coneGeometry,
            cylinderGeometry,
        ]);

        // i initially created the arrow to point downward, but I need it to point in the (1,0,0)
        // direction in order for "lookat" to work as expected.
        // maybe I'll go back and just construct the arrow correctly instead of incorrectly with
        // these rotations
        merged.rotateX(Math.PI / 2);
        merged.rotateY(Math.PI);
        return merged;
    }

    onNodeMoved(_event: any) {
        this.setPositions();
        this.geometry.attributes.position.needsUpdate = true;
    }

    setPositions() {
        this.position.set(
            this.node.position.x - BeamOsNode.nodeRadius * this.direction.x,
            this.node.position.y - BeamOsNode.nodeRadius * this.direction.y,
            this.node.position.z - BeamOsNode.nodeRadius * this.direction.z
        );
        this.lookAt(this.node.position);
    }

    public firePositionChangedEvent() {
        this.dispatchEvent({ type: "moved" });
    }
}
