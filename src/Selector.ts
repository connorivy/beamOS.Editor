import * as THREE from 'three';
import { RaycastInfo } from './Raycaster';
import { TransformController } from './TransformController';

export class Selector {
    private selectionBox: THREE.Box3Helper;
    private onDownPosition: THREE.Vector2 = new THREE.Vector2(0, 0)
    private onUpPosition: THREE.Vector2 = new THREE.Vector2(0, 0)
    private onMouseUpFunc: (_event: MouseEvent) => void

    constructor(
        private domElement: HTMLElement,
        private scene: THREE.Scene, 
        private mouse: THREE.Vector2,
        private raycastInfo: RaycastInfo, 
        private selectorInfo: SelectorInfo,
        private transformController: TransformController) {

        const box = new THREE.Box3();
        this.selectionBox = new THREE.Box3Helper(box);
        this.scene.add(this.selectionBox);
        this.onMouseUpFunc = this.onMouseUp.bind(this);
        this.selectHighlightedObject()

        window.addEventListener( 'mousedown', this.onMouseDown.bind(this) );
    }

    onMouseDown( event: MouseEvent ) {

		// event.preventDefault();

		if ( event.target !== this.domElement ) return;

		this.onDownPosition = this.mouse.clone();

		document.addEventListener( 'mouseup', this.onMouseUpFunc );

	}

	onMouseUp( _event: MouseEvent ) {

		this.onUpPosition = this.mouse.clone();

		this.handleClick();

		document.removeEventListener( 'mouseup', this.onMouseUpFunc );

	}

    selectHighlightedObject() {
        if (this.raycastInfo.currentlyRaycasted) {
            this.selectorInfo.currentlySelected = this.scene.getObjectById(this.raycastInfo.currentlyRaycasted.id);
            if (!this.selectorInfo.currentlySelected) {
                throw new Error(`Unable to get object with id ${this.raycastInfo.currentlyRaycasted.id} from scene`);
            }
            this.selectionBox.visible = true;
            this.transformController.transformControl.attach(this.selectorInfo.currentlySelected);
            this.selectionBox.box.setFromObject(this.selectorInfo.currentlySelected)
        } else {
            this.transformController.transformControl.detach();
            this.selectionBox.visible = false;
            this.selectorInfo.currentlySelected = undefined;
        }
    }

    handleClick() {

		if ( this.onDownPosition.distanceTo( this.onUpPosition ) !== 0 ) {

            return;

		}

        this.selectHighlightedObject()
	}

    animate() {
        // selection box should reflect current animation state
        if (this.selectorInfo.currentlySelected) {
            this.selectionBox.box.setFromObject( this.selectorInfo.currentlySelected, true );
        }
    }
}

export class SelectorInfo {
    public currentlySelected?: THREE.Object3D
}