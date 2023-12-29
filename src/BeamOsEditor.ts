import * as THREE from 'three';
import { Raycaster } from './Raycaster';
import { Controls } from './Controls';
import { TransformController } from './TransformController';
import { Selector, SelectorInfo } from './Selector';
import { EditorApi } from './EditorApi';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { SimpleGui } from './SimpleGui';
import { EditorConfigurations } from './EditorConfigurations';

export class BeamOsEditor {
    public scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    mouse: THREE.Vector2
    raycaster: Raycaster
    transformController: TransformController
    selector: Selector;
    editorConfigurations: EditorConfigurations;
    public api: EditorApi

    constructor(public domElement: HTMLElement)
    {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 1000 );
        this.camera.position.set( 5, 5, 10 );

        const selectorInfo = new SelectorInfo()

        this.renderer = new THREE.WebGLRenderer({ canvas: domElement, antialias: true });
        this.mouse = new THREE.Vector2(-1000, -1000);
        this.raycaster = new Raycaster(this.renderer, this.scene, this.mouse, this.camera, selectorInfo);
        const controls = new Controls(this.camera, this.domElement);
        this.transformController = new TransformController(this.scene, this.camera, this.domElement, controls.controls)
        this.selector = new Selector(
            this.domElement, 
            this.scene, 
            this.mouse, 
            this.raycaster.raycastInfo, 
            selectorInfo,
            this.transformController);
        
        this.editorConfigurations = new EditorConfigurations();

        this.api = new EditorApi(this.scene, this.editorConfigurations);

        this.initCanvas();
        // this.initGui();
        let simpleGui = new SimpleGui(this.editorConfigurations, this.scene, this.api);
        console.log(simpleGui);
        this.animate();
    }

    static createFromId(domElementId: string) : BeamOsEditor {
        const domElement = document.getElementById(domElementId);
        if (!domElement) {
            throw new Error(`Unable to find dom element with id ${domElementId}`);
        }
        return new this(domElement);
    }

    initCanvas() {
        this.scene.background = new THREE.Color(0x333333);
	    this.scene.matrixWorldAutoUpdate = true;

        window.addEventListener( 'resize', this.resizeCanvasToDisplaySize.bind(this) );
        window.dispatchEvent(new Event("resize"));
        // this.renderer.setSize( window.innerWidth, window.innerHeight );

        const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        const material = new THREE.MeshStandardMaterial( { color: 0x00ff00 } );
        const cube = new THREE.Mesh( geometry, material );
        this.scene.add( cube );

        const grid = new THREE.Group();

        const grid1 = new THREE.GridHelper( 30, 30, 0x282828 );
        grid1.material.color.setHex( 0x282828 );
        grid1.material.vertexColors = false;
        grid.add( grid1 );

        const grid2 = new THREE.GridHelper( 30, 6, 0x888888  );
        grid2.material.color.setHex( 0x888888  );
        grid2.material.vertexColors = false;
        grid.add( grid2 );

        this.scene.add(grid)

        let positions = [-10, -10, 0, 10, 10, 10];

        const lineGeometry = new LineGeometry();
	    lineGeometry.setPositions( positions );
        // lineGeometry.setColors( colors );

        let line = new Line2( lineGeometry, this.editorConfigurations.defaultElement1dMaterial );
        line.computeLineDistances();
        line.scale.set( 1, 1, 1 );
        this.scene.add( line );

        // const box = new THREE.Box3();
        // const selectionBox = new THREE.Box3Helper(box);
        // this.scene.add(selectionBox);
        // selectionBox.box.setFromObject(cube);
    }

    resizeCanvasToDisplaySize( _event: Event ) {
        const canvas = this.renderer.domElement;
        // look up the size the canvas is being displayed
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;     

        // adjust displayBuffer size to match
        if (canvas.width != width || canvas.height != height) {
            console.log('resize')
            // you must pass false here or three.js sadly fights the browser
            this.renderer.setSize(width, height, false);
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();

            // set matLine resolution
            this.editorConfigurations.defaultElement1dMaterial.resolution.set( width, height );

        }
    }

    public sayHello() {
        console.log("hello :)");
    }

    public animate() {
        requestAnimationFrame( this.animate.bind(this) );

        this.selector.animate();

        this.render();
    }

    render() {
        this.renderer.render( this.scene, this.camera );

        this.raycaster.raycast()
    }
}