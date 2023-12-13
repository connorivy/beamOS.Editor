import * as THREE from 'three';

export class Raycaster {
    public raycaster: THREE.Raycaster = new THREE.Raycaster();
    public tabIndex: number = 0
    public intersected?: IntersectedMeshProperties
    constructor(
        private renderer: THREE.Renderer,
        private scene: THREE.Scene,
        private mouse: THREE.Vector2,
        private camera: THREE.Camera) {

    }

    onPointerMove( event: MouseEvent ) {

        var rect = this.renderer.domElement.getBoundingClientRect();

        this.mouse.x = ( ( event.clientX - rect.left ) / ( rect.width ) ) * 2 - 1;
        this.mouse.y = - ( ( event.clientY - rect.top ) / ( rect.height) ) * 2 + 1;

    }

    raycast() {
        this.raycaster.setFromCamera( this.mouse, this.camera );

        const intersects = this.raycaster.intersectObjects( this.scene.children )
            .filter(o => !(o.object instanceof THREE.GridHelper))
            .map(o => o.object as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>)

        if ( intersects.length > 0 ) {
            this.tabIndex = intersects.length >= this.tabIndex 
            ? 0
            : this.tabIndex;
            const intersectedObj = intersects[this.tabIndex];

            if (this.intersected && this.intersected.id == intersectedObj.id) {
                return;
            }

            this.intersected = new IntersectedMeshProperties(
                intersectedObj.id, 
                intersectedObj.material.emissive.getHex())
            
            intersectedObj.material.emissive.setHex(0xff0000);
        }
        else {

            if ( this.intersected ) {
                const sceneObj = this.scene.getObjectById(this.intersected.id) as THREE.Mesh
                (sceneObj.material as THREE.MeshStandardMaterial).emissive.setHex(this.intersected.colorHex)
            }

            this.intersected = undefined;
        }
    }
}

export class IntersectedMeshProperties {
    constructor(public id: number, public colorHex : number ) {

    }
}