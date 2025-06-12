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
import { Controls } from "./Controls";

export class Selector {
    private selectionBox: THREE.Box3Helper;
    private onDownPosition: THREE.Vector2 = new THREE.Vector2(0, 0);
    private onUpPosition: THREE.Vector2 = new THREE.Vector2(0, 0);
    // private onMouseUpFunc: (_event: MouseEvent) => void;

    private isDragging: boolean = false;
    private dragStart: THREE.Vector2 = new THREE.Vector2();
    private dragEnd: THREE.Vector2 = new THREE.Vector2();
    private selectionRectElement: HTMLDivElement | null = null;
    private selectionGroup: THREE.Group = new THREE.Group();

    constructor(
        private domElement: HTMLElement,
        private scene: THREE.Scene,
        private mouse: THREE.Vector2,
        private raycastInfo: RaycastInfo,
        private selectorInfo: SelectorInfo,
        private transformController: TransformController,
        private editorConfigurations: EditorConfigurations,
        private controls: Controls,
        private camera: THREE.Camera
    ) {
        const box = new THREE.Box3();
        this.selectionBox = new THREE.Box3Helper(box);
        this.scene.add(this.selectionBox);
        this.scene.add(this.selectionGroup);
        // this.onMouseUpFunc = this.onMouseUp.bind(this);
        this.selectClickedObject();
        this.createSelectionRectElement();

        window.addEventListener("mousedown", this.onMouseDown.bind(this));
        window.addEventListener("mousemove", this.onMouseMove.bind(this));
        window.addEventListener("mouseup", this.onMouseUp.bind(this));
    }

    private createSelectionRectElement() {
        this.selectionRectElement = document.createElement("div");
        this.selectionRectElement.style.position = "absolute";
        this.selectionRectElement.style.border = "1px dashed #00aaff";
        this.selectionRectElement.style.background = "rgba(0,170,255,0.1)";
        this.selectionRectElement.style.pointerEvents = "none";
        this.selectionRectElement.style.display = "none";
        this.selectionRectElement.style.zIndex = "1000";
        this.domElement.parentElement?.appendChild(this.selectionRectElement);
    }

    onMouseDown(event: MouseEvent) {
        if (event.target !== this.domElement) return;
        this.onDownPosition = this.mouse.clone();
        this.dragStart.set(event.clientX, event.clientY);
        this.isDragging = true;

        if (this.selectionRectElement) {
            const rect = this.domElement.getBoundingClientRect();
            const left = event.clientX - rect.left;
            const top = event.clientY - rect.top;
            this.selectionRectElement.style.left = `${left}px`;
            this.selectionRectElement.style.top = `${top}px`;
            this.selectionRectElement.style.width = "0px";
            this.selectionRectElement.style.height = "0px";
            this.selectionRectElement.style.display = "block";
        }
    }

    onMouseMove(event: MouseEvent) {
        if (!this.isDragging) return;
        this.dragEnd.set(event.clientX, event.clientY);
        if (this.selectionRectElement) {
            const rect = this.domElement.getBoundingClientRect();
            const x1 = this.dragStart.x - rect.left;
            const y1 = this.dragStart.y - rect.top;
            const x2 = this.dragEnd.x - rect.left;
            const y2 = this.dragEnd.y - rect.top;
            const x = Math.min(x1, x2);
            const y = Math.min(y1, y2);
            const w = Math.abs(x2 - x1);
            const h = Math.abs(y2 - y1);
            this.selectionRectElement.style.left = `${x}px`;
            this.selectionRectElement.style.top = `${y}px`;
            this.selectionRectElement.style.width = `${w}px`;
            this.selectionRectElement.style.height = `${h}px`;
        }
    }

    onMouseUp(_event: MouseEvent) {
        this.onUpPosition = this.mouse.clone();
        this.isDragging = false;
        if (this.selectionRectElement) {
            this.selectionRectElement.style.display = "none";
        }

        const dragDistance = this.onDownPosition.distanceTo(this.onUpPosition);
        if (Math.abs(dragDistance) > 0.005) {
            this.handleDragSelect();
        } else {
            this.handleClick();
        }
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

            this.setSelection([raycastedMesh]);
        } else {
            this.DeselectAll();
        }
    }

    private setSelection(
        raycastedMeshes: (THREE.Object3D<THREE.Object3DEventMap> &
            IBeamOsMesh)[]
    ) {
        if (raycastedMeshes.length === 1) {
            let raycastedMesh = raycastedMeshes[0];
            const position = raycastedMesh.GetPosition();
            this.controls.setOrbitPoint(position.x, position.y, position.z);
        }

        this.selectorInfo.currentSelection = raycastedMeshes;
        this.selectionBox.visible = true;

        // if (!this.editorConfigurations.isReadOnly) {
        //     this.transformController.transformControl.attach(raycastedMesh);
        // }

        // Use different box setting method based on object type
        raycastedMeshes.forEach((raycastedMesh) => {
            if (raycastedMesh instanceof Line2) {
                console.log(
                    `Setting selection box for Line2 with id ${raycastedMesh.beamOsId}`
                );
                this.setSelectionBoxFromLine(raycastedMesh);
            } else if (isBeamOsMesh(raycastedMesh)) {
                const box = new THREE.Box3();
                let selectionBox = new THREE.Box3Helper(box);
                selectionBox.box.setFromObject(raycastedMesh);
                this.selectionGroup.add(selectionBox);
            }
        });
    }

    private DeselectAll() {
        if (!this.editorConfigurations.isReadOnly) {
            this.transformController.transformControl.detach();
        }
        this.selectionBox.visible = false;
        this.selectorInfo.currentSelection = [];
        this.selectionGroup.clear();
    }

    setSelectionBoxFromLine(line: Line2, padding: number = 0.1) {
        // Make sure the line's geometry has computed its bounding box
        if (!line.geometry.boundingBox) {
            line.geometry.computeBoundingBox();
        }

        if (line.geometry.boundingBox === null) {
            throw new Error("Line2 geometry has no bounding box");
        }
        const box = new THREE.Box3();
        let selectionBox = new THREE.Box3Helper(box);

        // Copy the geometry's bounding box
        box.copy(line.geometry.boundingBox);

        // Transform the box to world space using the line's world matrix
        box.applyMatrix4(line.matrixWorld);

        // Add padding
        box.min.subScalar(padding);
        box.max.addScalar(padding);

        // Store a flag to indicate this object has a custom box
        line.userData.hasCustomBox = true;
        this.selectionGroup.add(selectionBox);
    }

    handleClick() {
        this.selectClickedObject();
    }

    private handleDragSelect() {
        // Get selection rectangle in screen space
        const rect = this.domElement.getBoundingClientRect();
        const x1 = this.dragStart.x - rect.left;
        const y1 = this.dragStart.y - rect.top;
        const x2 = this.dragEnd.x - rect.left;
        const y2 = this.dragEnd.y - rect.top;
        const selMinX = Math.min(x1, x2);
        const selMaxX = Math.max(x1, x2);
        const selMinY = Math.min(y1, y2);
        const selMaxY = Math.max(y1, y2);
        const selectionRect = {
            minX: selMinX,
            maxX: selMaxX,
            minY: selMinY,
            maxY: selMaxY,
        };

        // Determine drag direction
        const rightToLeft = this.dragStart.x > this.dragEnd.x;

        // Collect all selectable objects
        const selectable: (THREE.Object3D & IBeamOsMesh)[] = [];
        this.scene.traverse((obj) => {
            if (isBeamOsMesh(obj)) {
                selectable.push(obj as THREE.Object3D & IBeamOsMesh);
            }
        });

        // Helper to project 3D point to 2D screen
        const projectToScreen = (
            vec3: THREE.Vector3
        ): { x: number; y: number } => {
            const vector = vec3.clone().project(this.camera);
            return {
                x: ((vector.x + 1) / 2) * rect.width,
                y: ((-vector.y + 1) / 2) * rect.height,
            };
        };

        // For each object, check if its screen rect intersects/contained in selectionRect
        const selected: (THREE.Object3D & IBeamOsMesh)[] = [];
        selectable.forEach((obj) => {
            // Get world bounding box
            let box = new THREE.Box3();
            if (obj instanceof Line2 && obj.geometry.boundingBox) {
                box.copy(obj.geometry.boundingBox);
                box.applyMatrix4(obj.matrixWorld);
            } else {
                box.setFromObject(obj);
            }
            // Project all 8 corners to screen
            const corners = [
                new THREE.Vector3(box.min.x, box.min.y, box.min.z),
                new THREE.Vector3(box.min.x, box.min.y, box.max.z),
                new THREE.Vector3(box.min.x, box.max.y, box.min.z),
                new THREE.Vector3(box.min.x, box.max.y, box.max.z),
                new THREE.Vector3(box.max.x, box.min.y, box.min.z),
                new THREE.Vector3(box.max.x, box.min.y, box.max.z),
                new THREE.Vector3(box.max.x, box.max.y, box.min.z),
                new THREE.Vector3(box.max.x, box.max.y, box.max.z),
            ];
            const projected = corners.map(projectToScreen);
            const objMinX = Math.min(...projected.map((p) => p.x));
            const objMaxX = Math.max(...projected.map((p) => p.x));
            const objMinY = Math.min(...projected.map((p) => p.y));
            const objMaxY = Math.max(...projected.map((p) => p.y));
            // Test intersection or containment
            if (rightToLeft) {
                // Intersect
                const intersects =
                    objMaxX >= selectionRect.minX &&
                    objMinX <= selectionRect.maxX &&
                    objMaxY >= selectionRect.minY &&
                    objMinY <= selectionRect.maxY;
                if (intersects) selected.push(obj);
            } else {
                // Contained
                const contained =
                    objMinX >= selectionRect.minX &&
                    objMaxX <= selectionRect.maxX &&
                    objMinY >= selectionRect.minY &&
                    objMaxY <= selectionRect.maxY;
                if (contained) selected.push(obj);
            }
        });
        this.setSelection(selected);
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
