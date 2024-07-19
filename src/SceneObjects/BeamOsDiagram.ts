import * as THREE from "three";
import { BeamOsMesh } from "../BeamOsMesh";
import {
    DiagramConsistantIntervalResponse,
    ShearDiagramResponse,
} from "../EditorApi/EditorApiAlpha";
import { BeamOsElement1d } from "./BeamOsElement1d";

export interface DiagramEventMap extends THREE.Object3DEventMap {
    moved: {};
}

export class BeamOsDiagram extends BeamOsMesh<
    THREE.BufferGeometry,
    THREE.Material,
    DiagramEventMap
> {
    public beamOsObjectType: string = "Diagram";
    private static DiagramHex: number = 0xff00ff;

    constructor(
        public beamOsId: string,
        private intervals: DiagramConsistantIntervalResponse[],
        private element1d: BeamOsElement1d
    ) {
        super(
            beamOsId,
            BeamOsDiagram.GetGeometry(intervals),
            new THREE.MeshStandardMaterial({
                color: BeamOsDiagram.DiagramHex,
                side: THREE.DoubleSide,
                // vertexColors: true,
                // wireframe: true,
            })
        );

        this.position.set(
            element1d.startNode.position.x,
            element1d.startNode.position.y,
            element1d.startNode.position.z
        );

        let deltaX =
            element1d.endNode.position.x - element1d.startNode.position.x;
        let deltaY =
            element1d.endNode.position.y - element1d.startNode.position.y;
        let deltaZ =
            element1d.endNode.position.z - element1d.startNode.position.z;

        let currentAngle = new THREE.Vector3(1, 0, 0);
        let desiredAngle = new THREE.Vector3(deltaX, deltaY, deltaZ);

        let axis = currentAngle.clone().cross(desiredAngle).normalize();
        let x = currentAngle.angleTo(desiredAngle);

        this.setRotationFromAxisAngle(axis, x);
        this.rotateOnAxis(currentAngle, Math.PI);
    }

    static GetGeometry(
        intervals: DiagramConsistantIntervalResponse[]
    ): THREE.BufferGeometry {
        let highestValue = this.GetHighestValue(intervals);
        let valueMult = 0.5 / highestValue;

        const point3dArr = new Array<number>();

        for (let i = 0; i < intervals.length - 1; i++) {
            let startLength = intervals[i].startLocation.value;
            let endLength = intervals[i].endLocation.value;
            let range = endLength - startLength;

            for (let arrowIndex = 1; arrowIndex < 4; arrowIndex++) {
                let currentX = startLength + (arrowIndex / 3) * range;
                let currentEval = this.EvalPolynomial(
                    intervals[i].polynomialCoefficients,
                    currentX
                );

                let previousX = startLength + ((arrowIndex - 1) / 3) * range;
                let prevEval = this.EvalPolynomial(
                    intervals[i].polynomialCoefficients,
                    previousX
                );

                // previous bottom triangle
                point3dArr.push(previousX, 0, 0);
                point3dArr.push(previousX, prevEval * valueMult, 0);
                point3dArr.push(currentX, 0, 0);

                // previous top triangle
                point3dArr.push(currentX, 0, 0);
                point3dArr.push(previousX, prevEval * valueMult, 0);
                point3dArr.push(currentX, currentEval * valueMult, 0);
            }
        }

        const colorPoints = new Array<number>();
        for (
            let vertexIndex = 0;
            vertexIndex < point3dArr.length;
            vertexIndex += 3
        ) {
            let unity = point3dArr[vertexIndex + 1] / 0.5;
            let color = this.GetColorFromUnity(unity);
            colorPoints.push(color.r, color.g, color.b);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(new Float32Array(point3dArr), 3)
        );
        geometry.setAttribute(
            "color",
            new THREE.BufferAttribute(new Float32Array(colorPoints), 3)
        );
        return geometry;
    }

    static GetHighestValue(
        intervals: DiagramConsistantIntervalResponse[]
    ): number {
        let highest = 0;

        intervals.forEach((interval) => {
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

    static GetColorFromUnity(unity: number): THREE.Color {
        const negativeColor = new THREE.Color(0, 0, 1);
        const neutralColor = new THREE.Color(220 / 256, 220 / 256, 220 / 256);
        const positiveColor = new THREE.Color(1, 0, 0);
        let result = new THREE.Color();

        if (unity >= 0 && unity <= 1) {
            result.lerpColors(neutralColor, positiveColor, unity);
        } else if (unity < 0 && unity >= -1) {
            result.lerpColors(neutralColor, negativeColor, unity);
        } else {
            throw new Error("Unity must be between [-1, 1]");
        }

        return result;
    }
}
