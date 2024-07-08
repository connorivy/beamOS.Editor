import * as THREE from "three";
import { SelectorInfo } from "./Selector";
import { IBeamOsMesh } from "./BeamOsMesh";
import { LineMaterial } from "three/examples/jsm/Addons.js";

export class Raycaster {
    public raycaster: THREE.Raycaster;
    public tabIndex: number = 0;
    public raycastInfo: RaycastInfo;
    private highlightHex: number = 0x6495ed;

    constructor(
        private renderer: THREE.Renderer,
        private scene: THREE.Scene,
        private mouse: THREE.Vector2,
        private camera: THREE.Camera,
        private selectorInfo: SelectorInfo
    ) {
        this.raycaster = new THREE.Raycaster();
        this.raycaster.params.Line.threshold = 1;
        this.raycaster.params.Line2 = { threshold: 0 };

        this.raycastInfo = new RaycastInfo();
        window.addEventListener("pointermove", this.onPointerMove.bind(this));
    }

    onPointerMove(event: MouseEvent) {
        var rect = this.renderer.domElement.getBoundingClientRect();

        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    raycast() {
        this.raycaster.setFromCamera(this.mouse, this.camera);

        const intersects = this.raycaster
            .intersectObjects(this.scene.children)
            .filter((o) => this.isBeamOsMesh(o.object))
            .map((o) => (<any>o.object) as IBeamOsMesh);

        if (intersects.length > 0) {
            this.tabIndex =
                intersects.length >= this.tabIndex ? 0 : this.tabIndex;
            const intersectedObj = intersects[this.tabIndex];

            if (this.selectorInfo.currentlySelected?.id == intersectedObj.id) {
                if (this.raycastInfo.currentlyRaycasted) {
                    this.unhighlightRaycasted();
                }
                return;
            }

            if (this.raycastInfo.currentlyRaycasted) {
                if (
                    this.raycastInfo.currentlyRaycasted.id == intersectedObj.id
                ) {
                    // same object is raycasted, just return
                    return;
                } else {
                    // different object is raycasted, unhover original raycasted object
                    this.unhighlightRaycasted();
                }
            }

            this.raycastInfo.currentlyRaycasted = new IntersectedMeshProperties(
                intersectedObj.id,
                intersectedObj.material
            );

            intersectedObj.material = this.getHoverMaterial(
                intersectedObj.material
            );
        } else {
            this.unhighlightRaycasted();
        }
    }

    unhighlightRaycasted() {
        if (this.raycastInfo.currentlyRaycasted) {
            const sceneObj = this.scene.getObjectById(
                this.raycastInfo.currentlyRaycasted.id
            ) as THREE.Mesh;
            sceneObj.material = this.raycastInfo.currentlyRaycasted.material;
        }
        this.raycastInfo.currentlyRaycasted = undefined;
    }

    getHoverMaterial<T extends THREE.Material>(material: T): T {
        if (material instanceof THREE.MeshStandardMaterial) {
            let clone = material.clone() as T & THREE.MeshStandardMaterial;
            clone.emissive.setHex(this.highlightHex);
            return clone;
        }
        if (material instanceof LineMaterial) {
            let clone = material.clone() as T & LineMaterial;
            clone.color = new THREE.Color(this.highlightHex);
            return clone;
        }

        return material;
    }

    isBeamOsMesh(object: any): object is IBeamOsMesh {
        return "beamOsId" in object;
    }
}

export class RaycastInfo {
    public currentlyRaycasted?: IntersectedMeshProperties;
}

export class IntersectedMeshProperties {
    constructor(public id: number, public material: THREE.Material) {}
}
