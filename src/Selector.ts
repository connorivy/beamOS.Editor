import * as THREE from "three";
import { RaycastInfo, isBeamOsMesh } from "./Raycaster";
import { TransformController } from "./TransformController";
import { IBeamOsMesh } from "./BeamOsMesh";
import {
    ChangeSelectionCommand,
    IEditorEventsApi,
    SelectedObject,
} from "./EditorApi/EditorEventsApi";
import { EditorConfigurations } from "./EditorConfigurations";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import CameraControls from "camera-controls";

export class Selector {
    private selectionBox: THREE.Box3Helper;
    private onDownPosition: THREE.Vector2 = new THREE.Vector2(0, 0);
    private onUpPosition: THREE.Vector2 = new THREE.Vector2(0, 0);
    private onMouseUpFunc: (_event: MouseEvent) => void;

    constructor(
        private domElement: HTMLElement,
        private scene: THREE.Scene,
        private mouse: THREE.Vector2,
        private raycastInfo: RaycastInfo,
        private selectorInfo: SelectorInfo,
        private transformController: TransformController,
        private editorConfigurations: EditorConfigurations,
        private controls: CameraControls
    ) {
        const box = new THREE.Box3();
        this.selectionBox = new THREE.Box3Helper(box);
        this.scene.add(this.selectionBox);
        this.onMouseUpFunc = this.onMouseUp.bind(this);
        this.selectClickedObject();

        window.addEventListener("mousedown", this.onMouseDown.bind(this));
    }

    onMouseDown(event: MouseEvent) {
        // event.preventDefault();

        if (event.target !== this.domElement) return;

        this.onDownPosition = this.mouse.clone();

        document.addEventListener("mouseup", this.onMouseUpFunc);
    }

    onMouseUp(_event: MouseEvent) {
        this.onUpPosition = this.mouse.clone();

        if (this.onDownPosition.distanceTo(this.onUpPosition) === 0) {
            this.handleClick();
        }

        document.removeEventListener("mouseup", this.onMouseUpFunc);
    }

    selectClickedObject() {
        if (this.raycastInfo.currentlyRaycasted) {
            const raycastedMesh = this.scene.getObjectById(
                this.raycastInfo.currentlyRaycasted.id
            );
            if (!isBeamOsMesh(raycastedMesh)) {
                throw new Error(
                    `Unable to get object with id ${this.raycastInfo.currentlyRaycasted.id} from scene`
                );
            }
            this.controls.setOrbitPoint(
                raycastedMesh.position.x,
                raycastedMesh.position.y,
                raycastedMesh.position.z
            );
            this.selectorInfo.currentSelection = [raycastedMesh];
            this.selectionBox.visible = true;

            if (!this.editorConfigurations.isReadOnly) {
                this.transformController.transformControl.attach(raycastedMesh);
            }

            // Use different box setting method based on object type
            if (raycastedMesh instanceof Line2) {
                this.setSelectionBoxFromLine(raycastedMesh);
            } else if (isBeamOsMesh(raycastedMesh)) {
                this.selectionBox.box.setFromObject(raycastedMesh);
            }
        } else {
            this.DeselectAll();
        }
    }

    private DeselectAll() {
        if (!this.editorConfigurations.isReadOnly) {
            this.transformController.transformControl.detach();
        }
        this.selectionBox.visible = false;
        this.selectorInfo.currentSelection = [];
    }

    setSelectionBoxFromLine(line: Line2, padding: number = 0.1) {
        const box = this.selectionBox.box;

        // Make sure the line's geometry has computed its bounding box
        if (!line.geometry.boundingBox) {
            line.geometry.computeBoundingBox();
        }

        if (line.geometry.boundingBox === null) {
            throw new Error("Line2 geometry has no bounding box");
        }

        // Copy the geometry's bounding box
        box.copy(line.geometry.boundingBox);

        // Transform the box to world space using the line's world matrix
        box.applyMatrix4(line.matrixWorld);

        // Add padding
        box.min.subScalar(padding);
        box.max.addScalar(padding);

        // Store a flag to indicate this object has a custom box
        line.userData.hasCustomBox = true;
    }

    handleClick() {
        this.selectClickedObject();
    }

    handleDrag() {
        // todo
    }

    animate() {
        //selection box should reflect current animation state
        if (this.selectorInfo.currentSelection.length > 0) {
            let selectedMesh = this.selectorInfo.currentSelection[0];
            if (selectedMesh instanceof Line2) {
                this.setSelectionBoxFromLine(selectedMesh);
            } else if (selectedMesh instanceof THREE.Object3D) {
                this.selectionBox.box.setFromObject(selectedMesh);
            }
        }
    }
}

export class SelectorInfo {
    private _currentSelection: IBeamOsMesh[] = [];

    constructor(
        private dotnetDispatcherApi: IEditorEventsApi,
        private canvasId: string
    ) { }

    public get currentSelection(): IBeamOsMesh[] {
        return this._currentSelection;
    }
    public set currentSelection(value: IBeamOsMesh[]) {
        this.dotnetDispatcherApi.dispatchChangeSelectionCommand(
            new ChangeSelectionCommand({
                canvasId: this.canvasId,
                selectedObjects: value.map(
                    (m) =>
                        new SelectedObject({
                            id: m.beamOsId,
                            typeName: m.beamOsObjectType,
                        })
                ),
            })
        );
        this._currentSelection = value;
    }
}
