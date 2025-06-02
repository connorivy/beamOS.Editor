import * as THREE from "three";
import { Raycaster } from "./Raycaster";
import { TransformController } from "./TransformController";
import { Selector, SelectorInfo } from "./Selector";
import { EditorApi } from "./EditorApi";
// import { Line2 } from 'three/addons/lines/Line2.js';
// import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
// import { SimpleGui } from './SimpleGui';
import { EditorConfigurations } from "./EditorConfigurations";
import { IEditorEventsApi } from "./EditorApi/EditorEventsApi";
import { DotnetApiFactory } from "./EditorApi/DotnetApiFactory";
import CameraControls from "camera-controls";

export class BeamOsEditor {
    public scene: THREE.Scene;
    sceneRoot: THREE.Group;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    mouse: THREE.Vector2;
    raycaster: Raycaster;
    transformController: TransformController;
    selector: Selector;
    public api: EditorApi;
    animationFrameId: number | undefined = undefined;
    observer: ResizeObserver;
    private controls: CameraControls;
    private clock: THREE.Clock = new THREE.Clock();

    constructor(
        public domElement: HTMLElement,
        public dotnetDispatcherApi: IEditorEventsApi,
        private editorConfigurations: EditorConfigurations
    ) {
        this.scene = new THREE.Scene();
        this.scene.add(new THREE.AmbientLight(0xaaaaaa, 10));

        // z-up scene by default
        this.sceneRoot = new THREE.Group();
        // this.sceneRoot.rotateX(-Math.PI / 2);
        // this.sceneRoot.up = new THREE.Vector3(0, 0, 1);
        this.scene.add(this.sceneRoot);

        this.camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(5, 5, 10);
        this.camera.up.set(0, 0, 1);
        editorConfigurations.yAxisUp = false;

        const selectorInfo = new SelectorInfo(
            dotnetDispatcherApi,
            domElement.id
        );

        this.renderer = new THREE.WebGLRenderer({
            canvas: domElement,
            antialias: true,
        });
        this.mouse = new THREE.Vector2(-1000, -1000);
        this.raycaster = new Raycaster(
            this.renderer,
            this.scene,
            this.mouse,
            this.camera
        );
        this.createCamera();
        this.controls = new CameraControls(this.camera, this.domElement);
        this.transformController = new TransformController(
            this.scene,
            this.camera,
            this.domElement,
            this.controls,
            dotnetDispatcherApi
        );
        this.selector = new Selector(
            this.domElement,
            this.scene,
            this.mouse,
            this.raycaster.raycastInfo,
            selectorInfo,
            this.transformController,
            editorConfigurations,
            this.controls,
        );

        this.api = new EditorApi(this.camera, this.controls, this.sceneRoot, editorConfigurations);

        const callback = this.resizeCanvasToDisplaySize.bind(this);
        this.observer = new ResizeObserver((entries) => {
            const width = entries[0].contentRect.width;
            const height = entries[0].contentRect.height;
            callback(width, height);
        });
        this.observer.observe(this.domElement);

        this.initCanvas();
        // this.initGui();
        //let simpleGui = new SimpleGui(this.editorConfigurations, this.scene, this.api);
        //console.log(simpleGui);
        this.animate();
    }

    static createFromId(
        domElementId: string,
        eventsApiDotnetRef: any,
        isReadOnly: boolean
    ): BeamOsEditor {
        const domElement = document.getElementById(domElementId);
        if (!domElement) {
            throw new Error(
                `Unable to find dom element with id ${domElementId}`
            );
        }

        let dotnetDispatcherApi =
            DotnetApiFactory<IEditorEventsApi>(eventsApiDotnetRef);
        let editorConfigurations = new EditorConfigurations(isReadOnly);

        return new this(domElement, dotnetDispatcherApi, editorConfigurations);
    }

    createCamera() {
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
    }

    initCanvas() {
        this.scene.background = new THREE.Color(0x333333);
        this.scene.matrixWorldAutoUpdate = true;

        const grid = new THREE.Group();

        const grid1 = new THREE.GridHelper(30, 30, 0x282828);
        grid1.material.color.setHex(0x282828);
        grid1.material.vertexColors = false;
        grid.add(grid1);

        const grid2 = new THREE.GridHelper(30, 6, 0x888888);
        grid2.material.color.setHex(0x888888);
        grid2.material.vertexColors = false;
        grid.add(grid2);

        //this.scene.add(grid);
    }

    resizeCanvasToDisplaySize(width: number, height: number) {
        // you must pass false here or three.js sadly fights the browser
        this.renderer.setSize(width, height, false);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        // set matLine resolution
        this.editorConfigurations.defaultElement1dMaterial.resolution.set(
            width,
            height
        );
    }

    public animate() {
        this.animationFrameId = requestAnimationFrame(this.animate.bind(this));

        const delta = this.clock.getDelta();
        //const elapsed = this.clock.getElapsedTime();
        //console.log('camera up', this.camera.up);
        this.controls.update(delta);
        this.selector.animate();

        this.render();
    }

    render() {
        this.renderer.render(this.scene, this.camera);

        this.raycaster.raycast();
    }

    public dispose() {
        this.observer.disconnect();
        this.observer.unobserve(this.domElement);

        // very important to cancel the animation loop
        // or else the model will not be freed up and garbage collected which will lead to a huge memory leak
        if (this.animationFrameId == undefined) {
            throw new Error("animationFrameId was undefined");
        }
        cancelAnimationFrame(this.animationFrameId);

        // while the above worked most of the time, sometimes the memory leak persisted.
        // this snippet of clearing the scene objects helps too
        this.scene.traverse((object) => {
            if (object instanceof THREE.Group) {
                object.clear();
            }
        });

        // unsure if this is necessary
        this.renderer.dispose();
    }
}
