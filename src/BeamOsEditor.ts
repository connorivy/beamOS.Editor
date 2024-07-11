import * as THREE from "three";
import { Raycaster } from "./Raycaster";
import { Controls } from "./Controls";
import { TransformController } from "./TransformController";
import { Selector, SelectorInfo } from "./Selector";
import { EditorApi } from "./EditorApi";
// import { Line2 } from 'three/addons/lines/Line2.js';
// import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
// import { SimpleGui } from './SimpleGui';
import { EditorConfigurations } from "./EditorConfigurations";
import { IEditorEventsApi } from "./EditorApi/EditorEventsApi";
import { IEditorEventsApiFactory } from "./EditorApi/EditorEventsApiProxy";

export class BeamOsEditor {
    public scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    mouse: THREE.Vector2;
    raycaster: Raycaster;
    transformController: TransformController;
    selector: Selector;
    editorConfigurations: EditorConfigurations;
    public api: EditorApi;

    constructor(
        public domElement: HTMLElement,
        public dispatcher: IEditorEventsApi
    ) {
        this.scene = new THREE.Scene();
        this.scene.add(new THREE.AmbientLight(0xaaaaaa));

        const light = new THREE.SpotLight(0xffffff, 10000);
        light.position.set(0, 25, 50);
        light.angle = Math.PI / 5;

        light.castShadow = true;
        light.shadow.camera.near = 10;
        light.shadow.camera.far = 100;
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;

        this.scene.add(light);

        this.camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(5, 5, 10);

        const selectorInfo = new SelectorInfo(dispatcher, domElement.id);

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
        const controls = new Controls(this.camera, this.domElement);
        this.transformController = new TransformController(
            this.scene,
            this.camera,
            this.domElement,
            controls.controls,
            dispatcher
        );
        this.selector = new Selector(
            this.domElement,
            this.scene,
            this.mouse,
            this.raycaster.raycastInfo,
            selectorInfo,
            this.transformController
        );

        this.editorConfigurations = new EditorConfigurations();

        this.api = new EditorApi(this.scene, this.editorConfigurations);

        this.initCanvas();
        // this.initGui();
        //let simpleGui = new SimpleGui(this.editorConfigurations, this.scene, this.api);
        //console.log(simpleGui);
        this.animate();
    }

    static createFromId(
        domElementId: string,
        dotnetRef: IEditorEventsApi
    ): BeamOsEditor {
        const domElement = document.getElementById(domElementId);
        if (!domElement) {
            throw new Error(
                `Unable to find dom element with id ${domElementId}`
            );
        }

        let dispatcher = IEditorEventsApiFactory(dotnetRef);

        return new this(domElement, dispatcher);
    }

    initCanvas() {
        this.scene.background = new THREE.Color(0x333333);
        this.scene.matrixWorldAutoUpdate = true;

        window.addEventListener(
            "resize",
            this.resizeCanvasToDisplaySize.bind(this)
        );
        window.dispatchEvent(new Event("resize"));
        // this.renderer.setSize( window.innerWidth, window.innerHeight );

        const grid = new THREE.Group();

        const grid1 = new THREE.GridHelper(30, 30, 0x282828);
        grid1.material.color.setHex(0x282828);
        grid1.material.vertexColors = false;
        grid.add(grid1);

        const grid2 = new THREE.GridHelper(30, 6, 0x888888);
        grid2.material.color.setHex(0x888888);
        grid2.material.vertexColors = false;
        grid.add(grid2);

        this.scene.add(grid);
    }

    resizeCanvasToDisplaySize(_event: Event) {
        const canvas = this.renderer.domElement;
        // look up the size the canvas is being displayed
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        // adjust displayBuffer size to match
        if (canvas.width != width || canvas.height != height) {
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
    }

    public sayHello() {
        console.log("hello :)");
    }

    public animate() {
        requestAnimationFrame(this.animate.bind(this));

        this.selector.animate();

        this.render();
    }

    render() {
        this.renderer.render(this.scene, this.camera);

        this.raycaster.raycast();
    }
}
