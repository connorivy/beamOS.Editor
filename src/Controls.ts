import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { MapControls } from "three/addons/controls/MapControls.js";
import CameraControls from "camera-controls";

export class Controls {
    private cameraControls: CameraControls;
    private handleShiftKeyDownFunc: (_event: KeyboardEvent) => void;
    private handleShiftKeyUpFunc: (_event: KeyboardEvent) => void;

    constructor(
        private camera: THREE.PerspectiveCamera | THREE.OrthographicCamera,
        private domElement: HTMLElement
    ) {
        this.cameraControls = this.createCameraControls();
        this.handleShiftKeyDownFunc = this.handleShiftKeyDown.bind(this);
        this.handleShiftKeyUpFunc = this.handleShiftKeyUp.bind(this);

        window.addEventListener("keydown", this.handleShiftKeyDownFunc);
        window.addEventListener("keyup", this.handleShiftKeyUpFunc);
    }

    private handleShiftKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Shift") {
            this.cameraControls.mouseButtons.middle =
                CameraControls.ACTION.ROTATE;
        }
    };
    private handleShiftKeyUp = (e: KeyboardEvent) => {
        if (e.key === "Shift") {
            this.cameraControls.mouseButtons.middle =
                CameraControls.ACTION.TRUCK;
        }
    };

    private createCameraControls(): CameraControls {
        const subsetOfTHREE = {
            Vector2: THREE.Vector2,
            Vector3: THREE.Vector3,
            Vector4: THREE.Vector4,
            Quaternion: THREE.Quaternion,
            Matrix4: THREE.Matrix4,
            Spherical: THREE.Spherical,
            Box3: THREE.Box3,
            Sphere: THREE.Sphere,
            Raycaster: THREE.Raycaster,
        };
        CameraControls.install({ THREE: subsetOfTHREE });

        let cameraControls = new CameraControls(this.camera, this.domElement);
        cameraControls.infinityDolly = true;
        cameraControls.dollyToCursor = true;
        cameraControls.minDistance = 1;
        cameraControls.maxDistance = 1000;
        cameraControls.verticalDragToForward = false;
        cameraControls.mouseButtons.left = CameraControls.ACTION.NONE;
        cameraControls.mouseButtons.right = THREE.MOUSE.RIGHT;
        cameraControls.mouseButtons.middle = CameraControls.ACTION.TRUCK;

        return cameraControls;
    }

    // create property 'enabled'
    get enabled(): boolean {
        return this.cameraControls.enabled;
    }
    set enabled(value: boolean) {
        this.cameraControls.enabled = value;
    }

    setOrbitPointFromVector(vector: THREE.Vector3) {
        this.setOrbitPoint(vector.x, vector.y, vector.z);
    }
    setOrbitPoint(x: number, y: number, z: number) {
        this.cameraControls.setOrbitPoint(x, y, z);
    }
    updateCameraUp() {
        this.cameraControls.updateCameraUp();
    }
    update(delta: number) {
        this.cameraControls.update(delta);
    }
    public lookAt(x: number, y: number, z: number) {
        this.cameraControls.setTarget(x, y, z);
    }

    useRevitControls(
        camera: THREE.Camera,
        domElement: HTMLElement
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
        domElement: HTMLElement
    ): OrbitControls {
        return new OrbitControls(camera, domElement);
    }

    onDraggingChanged(event: DragEvent) {
        console.log(event);
        // this.controls.enabled = event.
    }

    public dispose() {
        this.cameraControls.dispose();
        window.removeEventListener("keydown", this.handleShiftKeyDownFunc);
        window.removeEventListener("keyup", this.handleShiftKeyUpFunc);
    }
}
