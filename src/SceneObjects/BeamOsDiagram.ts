import * as THREE from "three";
import { BeamOsMesh } from "../BeamOsMesh";
import { DiagramConsistentIntervalResponse } from "../EditorApi/EditorApiAlpha";
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
    // private static DiagramHex: number = 0xff00ff;

    constructor(
        public beamOsId: string,
        intervals: DiagramConsistentIntervalResponse[],
        element1d: BeamOsElement1d,
        yAxisUp: boolean,
        maxValue: number
    ) {
        super(
            beamOsId,
            BeamOsDiagram.GetGeometry(intervals, element1d, maxValue),
            new THREE.MeshStandardMaterial({
                // color: BeamOsDiagram.DiagramHex,
                side: THREE.DoubleSide,
                vertexColors: true,
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

        // GetGeometry is assuming a yAxis is up (three js conventions).
        // Must rotate the geometry if that is the case
        if (!yAxisUp) {
            this.rotateOnAxis(currentAngle, Math.PI / 2);
        }
    }

    static GetGeometry(
        intervals: DiagramConsistentIntervalResponse[],
        element1d: BeamOsElement1d,
        maxValue: number
    ): THREE.BufferGeometry {
        let maxValueMult = 1 / maxValue;

        const point3dArr = new Array<number>();

        const worldStart = element1d.startNode.position;
        const worldEnd = element1d.endNode.position;
        const worldRange = worldEnd.distanceTo(worldStart);

        const localRange =
            intervals[intervals.length - 1].endLocation.value -
            intervals[0].startLocation.value;

        const worldRangeScalingFactor = worldRange / localRange;

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
                point3dArr.push(previousX * worldRangeScalingFactor, 0, 0);
                point3dArr.push(
                    previousX * worldRangeScalingFactor,
                    prevEval * maxValueMult,
                    0
                );
                point3dArr.push(currentX * worldRangeScalingFactor, 0, 0);

                // previous top triangle
                point3dArr.push(currentX * worldRangeScalingFactor, 0, 0);
                point3dArr.push(
                    previousX * worldRangeScalingFactor,
                    prevEval * maxValueMult,
                    0
                );
                point3dArr.push(
                    currentX * worldRangeScalingFactor,
                    currentEval * maxValueMult,
                    0
                );
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
        intervals: DiagramConsistentIntervalResponse[]
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
        const neutralColor = new THREE.Color(1, 1, 1);
        const positiveColor = new THREE.Color(1, 0, 0);
        let result = new THREE.Color();

        // if (unity >= 1) {
        //     result.set(positiveColor);
        // } else if (unity >= 0) {
        //     result.lerpColors(neutralColor, positiveColor, unity);
        // } else if (unity >= -1) {
        //     result.lerpColors(neutralColor, negativeColor, unity);
        // } else {
        //     result.set(negativeColor);
        // }

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
