import * as THREE from 'three';
import { SelectorInfo } from './Selector';

export class Raycaster {
    public raycaster: THREE.Raycaster = new THREE.Raycaster();
    public tabIndex: number = 0
    public raycastInfo: RaycastInfo
    constructor(
        private renderer: THREE.Renderer,
        private scene: THREE.Scene,
        private mouse: THREE.Vector2,
        private camera: THREE.Camera,
        private selectorInfo: SelectorInfo) {

            this.raycastInfo = new RaycastInfo();
            window.addEventListener( 'pointermove', this.onPointerMove.bind(this) );
    }

    onPointerMove( event: MouseEvent ) {

        var rect = this.renderer.domElement.getBoundingClientRect();

        this.mouse.x = ( ( event.clientX - rect.left ) / ( rect.width ) ) * 2 - 1;
        this.mouse.y = - ( ( event.clientY - rect.top ) / ( rect.height) ) * 2 + 1;

    }

    raycast() {
        this.raycaster.setFromCamera( this.mouse, this.camera );

        const intersects = this.raycaster.intersectObjects( this.scene.children )
            .filter(o => !(o.object instanceof THREE.GridHelper) 
                && o.object instanceof THREE.Mesh
                && o.object.material instanceof THREE.MeshStandardMaterial)
            .map(o => o.object as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>)

        if ( intersects.length > 0 ) {
            this.tabIndex = intersects.length >= this.tabIndex 
            ? 0
            : this.tabIndex;
            const intersectedObj = intersects[this.tabIndex];

            if (this.selectorInfo.currentlySelected?.id == intersectedObj.id) {
                if (this.raycastInfo.currentlyRaycasted) {
                    this.unhighlightRaycasted();
                }
                return;
            }

            if (this.raycastInfo.currentlyRaycasted 
                && this.raycastInfo.currentlyRaycasted.id == intersectedObj.id) {
                return;
            }

            this.raycastInfo.currentlyRaycasted = new IntersectedMeshProperties(
                intersectedObj.id, 
                intersectedObj.material.emissive.getHex())
            
            intersectedObj.material.emissive.setHex(0xff0000);
        }
        else {

            this.unhighlightRaycasted();
        }
    }
   
    unhighlightRaycasted() {
        if ( this.raycastInfo.currentlyRaycasted ) {
            const sceneObj = this.scene.getObjectById(this.raycastInfo.currentlyRaycasted.id) as THREE.Mesh
            (sceneObj.material as THREE.MeshStandardMaterial).emissive.setHex(this.raycastInfo.currentlyRaycasted.colorHex)
        }
        this.raycastInfo.currentlyRaycasted = undefined;
    }
}

export class RaycastInfo {
    public currentlyRaycasted?: IntersectedMeshProperties
}

export class IntersectedMeshProperties {
    constructor(public id: number, public colorHex : number ) {

    }
}