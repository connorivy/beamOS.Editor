import * as THREE from 'three';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

export class TransformController {
    public transformControl : TransformControls
    constructor(camera: THREE.Camera, domElement: HTMLElement, private controls: OrbitControls) {
        this.transformControl = new TransformControls( camera, domElement );
		this.transformControl.addEventListener( 'dragging-changed', this.onDraggingChanged.bind(this) );
    }

    onDraggingChanged( event: any ) {
        this.controls.enabled = !event.value
    }
}