import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { MapControls } from "three/addons/controls/MapControls.js";

export class Controls {
    public controls: OrbitControls;
    constructor(camera: THREE.Camera, domElement: HTMLElement) {
        this.controls = this.useOrbitControls(camera, domElement);

        //controls.update() must be called after any manual changes to the camera's transform
        this.controls.update();
    }

    useRevitControls(
        camera: THREE.Camera,
        domElement: HTMLElement,
    ): MapControls {
        const controls = new MapControls(camera, domElement);
        controls.screenSpacePanning = true;
        controls.enablePan = true;
        controls.maxPolarAngle = Math.PI / 2;
        controls.mouseButtons = {
            MIDDLE: THREE.MOUSE.RIGHT,
            RIGHT: THREE.MOUSE.RIGHT,
        };
        return controls;
    }

    useOrbitControls(
        camera: THREE.Camera,
        domElement: HTMLElement,
    ): OrbitControls {
        return new OrbitControls(camera, domElement);
    }

    onDraggingChanged(event: DragEvent) {
        console.log(event);
        // this.controls.enabled = event.
    }
}
