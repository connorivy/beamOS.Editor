import * as THREE from "three";
import { BufferGeometryUtils } from "three/examples/jsm/Addons.js";
import { BeamOsMesh } from "../BeamOsMesh";
import { ShearDiagramResponse } from "../EditorApi/EditorApiAlpha";
import { BeamOsNode } from "./BeamOsNode";
import { BeamOsPointLoad } from "./BeamOsPointLoad";
import { BeamOsElement1d } from "./BeamOsElement1d";

export interface DistributedLoadEventMap extends THREE.Object3DEventMap {
    moved: {};
}

export class BeamOsDistributedLoad extends BeamOsMesh<
    THREE.BufferGeometry,
    THREE.Material,
    DistributedLoadEventMap
> {
    public beamOsObjectType: string = "DistributedLoad";

    private static DistributedLoadHex: number = 0x00ff00;
    private static DistributedLoadConeRadius: number = 0.1;
    private static DistributedLoadConeHeight: number = 0.2;
    private static coneDirectionalOffset: number = -5;

    private static DistributedLoadCylinderRadius: number = 0.04;
    private static DistributedLoadCylinderHeight: number =
        this.DistributedLoadCylinderRadius * 10;

    constructor(
        public beamOsId: string,
        private shearDiagramResponse: ShearDiagramResponse,
        private element1d: BeamOsElement1d
    ) {
        super(
            beamOsId,
            BeamOsDistributedLoad.GetGeometry(shearDiagramResponse, element1d),
            new THREE.MeshLambertMaterial({
                color: BeamOsDistributedLoad.DistributedLoadHex,
            })
        );

        this.position.set(
            element1d.startNode.position.x +
                BeamOsElement1d.lineThickness *
                    shearDiagramResponse.globalShearDirection.x,
            element1d.startNode.position.y +
                BeamOsElement1d.lineThickness *
                    shearDiagramResponse.globalShearDirection.y,
            element1d.startNode.position.z +
                BeamOsElement1d.lineThickness *
                    shearDiagramResponse.globalShearDirection.z
        );

        // var p1 = new THREE.Vector3();
        // var p2 = new THREE.Vector3();
        // var lookAt = new THREE.Vector3();
        // var axis = new THREE.Vector3(
        //     shearDiagramResponse.globalShearDirection.x,
        //     shearDiagramResponse.globalShearDirection.y,
        //     shearDiagramResponse.globalShearDirection.z
        // );
        // lookAt.copy(element1d.startNode.position);
        // .sub(p1)
        // .applyAxisAngle(axis, Math.PI * 0.5);
        // .add(p1);

        let currentAngle = new THREE.Vector3(0, 0, 1);
        let desiredAngle = new THREE.Vector3(
            shearDiagramResponse.globalShearDirection.x,
            shearDiagramResponse.globalShearDirection.y,
            shearDiagramResponse.globalShearDirection.z
        );
        let deltaX =
            element1d.endNode.position.x - element1d.startNode.position.x;
        let deltaY =
            element1d.endNode.position.y - element1d.startNode.position.y;
        let deltaZ =
            element1d.endNode.position.z - element1d.startNode.position.z;

        let axis = currentAngle.clone().cross(desiredAngle).normalize();
        let otherAxis = new THREE.Vector3(deltaX, deltaY, deltaZ).normalize();
        let x = currentAngle.angleTo(desiredAngle);

        this.lookAt(element1d.startNode.position);
        // this.position.applyAxisAngle(axis, x);
    }

    static GetGeometry(
        diagram: ShearDiagramResponse,
        element1d: BeamOsElement1d
    ): THREE.BufferGeometry {
        const geometries: THREE.BufferGeometry[] = [];
        // let highestValue = this.GetHighestValue(diagram);
        let deltaX =
            element1d.endNode.position.x - element1d.startNode.position.x;
        let deltaY =
            element1d.endNode.position.y - element1d.startNode.position.y;
        let deltaZ =
            element1d.endNode.position.z - element1d.startNode.position.z;
        let distance = Math.sqrt(
            deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ
        );

        for (let i = 0; i < diagram.intervals.length; i++) {
            const currentDiagram = diagram.intervals[i];
            // const nextDiagram =
            //     i + 1 == diagram.intervals.length
            //         ? null
            //         : diagram.intervals[i + 1];

            let startLength = diagram.intervals[i].startLocation.value;
            let endLength = diagram.intervals[i].endLocation.value;
            let range = endLength - startLength;

            for (let arrowIndex = 0; arrowIndex < 3; arrowIndex++) {
                let currentX = startLength + (arrowIndex / 3) * range;
                let polyEval = this.EvalPolynomial(
                    diagram.intervals[i].polynomialCoefficients,
                    currentX
                );
                let pointAlongBeam = new THREE.Vector3(
                    element1d.startNode.position.x +
                        (deltaX * currentX) / distance,
                    element1d.startNode.position.y +
                        (deltaY * currentX) / distance,
                    element1d.startNode.position.z +
                        (deltaZ * currentX) / distance
                );

                let newGeo = BeamOsPointLoad.GetGeometry()
                    // .scale(polyEval, polyEval, polyEval)
                    .translate(
                        (deltaX * currentX) / distance,
                        (deltaY * currentX) / distance,
                        (deltaZ * currentX) / distance
                    );
                // .translate(
                //     pointAlongBeam.x +
                //         BeamOsElement1d.lineThickness *
                //             diagram.globalShearDirection.x,
                //     pointAlongBeam.y +
                //         BeamOsElement1d.lineThickness *
                //             diagram.globalShearDirection.y,
                //     pointAlongBeam.z +
                //         BeamOsElement1d.lineThickness *
                //             diagram.globalShearDirection.z
                // );
                // .lookAt(pointAlongBeam.clone());

                geometries.push(newGeo);
            }
        }
        var geos = BufferGeometryUtils.mergeGeometries(geometries);
        return BufferGeometryUtils.mergeGeometries(geometries);
    }

    static GetHighestValue(diagram: ShearDiagramResponse): number {
        let highest = 0;

        diagram.intervals.forEach((interval) => {
            let startLength = interval.startLocation.value;
            let endLength = interval.endLocation.value;
            let range = endLength - startLength;

            for (let i = 0; i < 15; i++) {
                let currentX = startLength + (i / 15) * range;
                let polyEval = this.EvalPolynomial(
                    interval.polynomialCoefficients,
                    currentX
                );
                highest = Math.max(highest, Math.abs(polyEval));
            }
        });

        return highest;
    }

    static EvalPolynomial(coefficients: number[], xVal: number) {
        let result = 0;
        for (let i = 0; i < coefficients.length; i++) {
            result += coefficients[i] * Math.pow(xVal, i);
        }

        return result;
    }
}
