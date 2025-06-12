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
import { BeamOsElement1d } from "./SceneObjects/BeamOsElement1d";

export class Selector {
    private onDownPosition: THREE.Vector2 = new THREE.Vector2(0, 0);
    private onUpPosition: THREE.Vector2 = new THREE.Vector2(0, 0);
    private onMouseUpFunc: (_event: MouseEvent) => void;
    private onMouseMoveFunc: (_event: MouseEvent) => void;
    private onMouseDownFunc: (_event: MouseEvent) => void;

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
        this.scene.add(this.selectionGroup);
        this.selectClickedObject();
        this.createSelectionRectElement();

        this.onMouseDownFunc = this.onMouseDown.bind(this);
        this.onMouseMoveFunc = this.onMouseMove.bind(this);
        this.onMouseUpFunc = this.onMouseUp.bind(this);

        domElement.addEventListener("mousedown", this.onMouseDownFunc);
        domElement.addEventListener("mousemove", this.onMouseMoveFunc);
        domElement.addEventListener("mouseup", this.onMouseUpFunc);
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
        if (event.button !== 0) return; // Only handle left mouse button
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
        if (event.button !== 0) return; // Only handle left mouse button
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

    onMouseUp(event: MouseEvent) {
        if (event.button !== 0) return; // Only handle left mouse button
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
        this.DeselectAll();
        if (raycastedMeshes.length === 1) {
            let raycastedMesh = raycastedMeshes[0];
            const position = raycastedMesh.GetPosition();
            this.controls.setOrbitPoint(position.x, position.y, position.z);
        }

        this.selectorInfo.currentSelection = raycastedMeshes;

        // if (!this.editorConfigurations.isReadOnly) {
        //     this.transformController.transformControl.attach(raycastedMesh);
        // }

        // Use different box setting method based on object type
        raycastedMeshes.forEach((raycastedMesh) => {
            if (raycastedMesh instanceof BeamOsElement1d) {
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
        this.selectorInfo.currentSelection = [];
        this.selectionGroup.clear();
    }

    setSelectionBoxFromLine(element: BeamOsElement1d, padding: number = 0.1) {
        // Get start and end points in world coordinates
        const start = element.startNode.position.clone();
        const end = element.endNode.position.clone();

        // Compute direction and length
        const direction = new THREE.Vector3().subVectors(end, start);
        const length = direction.length();
        direction.normalize();

        // Compute midpoint
        const mid = new THREE.Vector3()
            .addVectors(start, end)
            .multiplyScalar(0.5);

        // Box dimensions: long axis = length + 2*padding, other axes = thickness
        const thickness = padding * 2; // or use element thickness if available
        const boxGeometry = new THREE.BoxGeometry(
            length + 2 * padding,
            thickness,
            thickness
        );

        // Create a wireframe or transparent mesh for selection
        const boxMaterial = new THREE.MeshBasicMaterial({
            color: 0x00aaff,
            wireframe: true,
            transparent: true,
            opacity: 0.5,
            depthTest: false,
        });
        const selectionMesh = new THREE.Mesh(boxGeometry, boxMaterial);

        // Align box with element direction (default box is along X axis)
        // Find quaternion that rotates X axis to direction
        const quat = new THREE.Quaternion();
        quat.setFromUnitVectors(new THREE.Vector3(1, 0, 0), direction);
        selectionMesh.setRotationFromQuaternion(quat);

        // Position at midpoint
        selectionMesh.position.copy(mid);

        // Add to selection group
        this.selectionGroup.add(selectionMesh);
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
        // if (this.selectorInfo.currentSelection.length > 0) {
        //     let selectedMesh = this.selectorInfo.currentSelection[0];
        //     if (selectedMesh instanceof BeamOsElement1d) {
        //         this.setSelectionBoxFromLine(selectedMesh);
        //     } else if (selectedMesh instanceof THREE.Object3D) {
        //         this.selectionBox.box.setFromObject(selectedMesh);
        //     }
        // }
    }

    public dispose() {
        this.domElement.removeEventListener("mousedown", this.onMouseDownFunc);
        this.domElement.removeEventListener("mousemove", this.onMouseMoveFunc);
        this.domElement.removeEventListener("mouseup", this.onMouseUpFunc);

        if (this.selectionRectElement) {
            this.selectionRectElement.remove();
            this.selectionRectElement = null;
        }

        this.scene.remove(this.selectionGroup);
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
