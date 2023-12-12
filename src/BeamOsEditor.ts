import * as THREE from 'three';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { EditorControls } from './EditorControls';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

export class BeamOsEditor {
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer

    constructor(public domElement: HTMLElement)
    {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.initCanvas();
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
        this.scene.background = new THREE.Color(0x888888);
	    this.scene.matrixWorldAutoUpdate = true;


        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.domElement.appendChild(this.renderer.domElement);

        const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        const cube = new THREE.Mesh( geometry, material );
        this.scene.add( cube );

        this.camera.position.z = 5;
        const transformControls = new TransformControls( this.camera, this.domElement );

        const controls = new EditorControls(this.camera, this.domElement)
        controls.enabled = true;
    }

    public animate() {
        requestAnimationFrame( this.animate.bind(this) );
        this.render()
    }

    render() {
        this.renderer.render( this.scene, this.camera );
    }
}