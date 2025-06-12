import * as THREE from "three";
import { Controls } from "./Controls";

export class Camera {
    public camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;

    constructor(
        public domElement: HTMLElement,
        public aspectRatio: number = window.innerWidth / window.innerHeight
    ) {
        const cameraPosition = new THREE.Vector3(5, 5, 10);
        const cameraUp = new THREE.Vector3(0, 0, 1);

        this.camera = this.createPerspectiveCamera(cameraPosition, cameraUp);
    }

    public createOrthographicCamera(
        cameraPosition: THREE.Vector3,
        cameraUp: THREE.Vector3
    ): THREE.OrthographicCamera {
        const aspect = this.aspectRatio;
        const frustumSize = 20;
        const camera = new THREE.OrthographicCamera(
            (frustumSize * aspect) / -2,
            (frustumSize * aspect) / 2,
            frustumSize / 2,
            frustumSize / -2,
            0.1,
            1000
        );
        camera.position.copy(cameraPosition);
        camera.up.copy(cameraUp);
        return camera;
    }

    public createPerspectiveCamera(
        cameraPosition: THREE.Vector3,
        cameraUp: THREE.Vector3
    ): THREE.PerspectiveCamera {
        const camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.copy(cameraPosition);
        camera.up.copy(cameraUp);
        return camera;
    }

    switchCamera(): THREE.Vector3 {
        let target = new THREE.Vector3(0, 0, -1);
        if (this.camera instanceof THREE.PerspectiveCamera) {
            const position = this.camera.position.clone();
            const up = this.camera.up.clone();
            target.applyQuaternion(this.camera.quaternion);

            const distance = position.length();
            const aspect = this.aspectRatio;
            const fov = THREE.MathUtils.degToRad(this.camera.fov);
            const frustumHeight = 2 * distance * Math.tan(fov / 2);
            const frustumSize = frustumHeight;
            const orthoCamera = new THREE.OrthographicCamera(
                (frustumSize * aspect) / -2,
                (frustumSize * aspect) / 2,
                frustumSize / 2,
                frustumSize / -2,
                0.1,
                1000
            );
            orthoCamera.position.copy(position);
            orthoCamera.up.copy(up);
            const lookAtTarget = position
                .clone()
                .add(target.multiplyScalar(10));
            orthoCamera.lookAt(lookAtTarget);

            console.log(
                `Switched to orth camera with FOV: ${fov}, position: ${position.toArray()}, up: ${up.toArray()}, lookAt: ${lookAtTarget.toArray()}`
            );
            target = lookAtTarget;
            this.camera = orthoCamera;
        } else if (this.camera instanceof THREE.OrthographicCamera) {
            const position = this.camera.position.clone();
            const up = this.camera.up.clone();
            // Compute the direction the ortho camera is looking
            this.camera.getWorldDirection(target);
            // Compute distance from camera to target (use current z distance for FOV)
            const distance = position.length();
            const aspect = this.aspectRatio;
            // Use the ortho frustum height to compute a matching FOV for perspective
            const orthoHeight = this.camera.top - this.camera.bottom;
            // fov = 2 * atan(orthoHeight / (2 * distance))
            const fov = THREE.MathUtils.radToDeg(
                2 * Math.atan(orthoHeight / (2 * distance))
            );
            const perspCamera = new THREE.PerspectiveCamera(
                fov,
                aspect,
                0.1,
                1000
            );
            perspCamera.position.copy(position);
            perspCamera.up.copy(up);
            const lookAtTarget = position
                .clone()
                .add(target.multiplyScalar(10));

            perspCamera.lookAt(lookAtTarget);
            console.log(
                `Switched to perspective camera with FOV: ${fov}, position: ${position.toArray()}, up: ${up.toArray()}, lookAt: ${lookAtTarget.toArray()}`
            );
            target = lookAtTarget;
            this.camera = perspCamera;
        }
        this.camera.updateProjectionMatrix();
        return target;
    }

    public lookAt(x: number, y: number, z: number, controls: Controls) {
        controls.lookAt(x, y, z);
    }

    public getCamera(): THREE.PerspectiveCamera | THREE.OrthographicCamera {
        return this.camera;
    }
}
