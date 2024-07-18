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
        private editorConfigurations: EditorConfigurations
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
            this.selectorInfo.currentSelection = [raycastedMesh];
            this.selectionBox.visible = true;

            if (!this.editorConfigurations.isReadOnly) {
                this.transformController.transformControl.attach(raycastedMesh);
            }
            this.selectionBox.box.setFromObject(raycastedMesh);
        } else {
            if (!this.editorConfigurations.isReadOnly) {
                this.transformController.transformControl.detach();
            }
            this.selectionBox.visible = false;
            this.selectorInfo.currentSelection = [];
        }
    }

    handleClick() {
        this.selectClickedObject();
    }

    handleDrag() {
        // todo
    }

    animate() {
        // selection box should reflect current animation state
        if (this.selectorInfo.currentSelection.length > 0) {
            this.selectionBox.box.setFromObject(
                (<any>this.selectorInfo.currentSelection[0]) as THREE.Object3D,
                true
            );
        }
    }
}

export class SelectorInfo {
    private _currentSelection: IBeamOsMesh[] = [];

    constructor(
        private dotnetDispatcherApi: IEditorEventsApi,
        private canvasId: string
    ) {}

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
