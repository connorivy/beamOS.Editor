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
    private onMouseUpFunc: (_event: MouseEvent) => void;

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
        this.onMouseUpFunc = this.onMouseUp.bind(this);
        this.selectClickedObject();
        this.createSelectionRectElement();

        window.addEventListener("mousedown", this.onMouseDown.bind(this));
        window.addEventListener("mousemove", this.onMouseMove.bind(this));
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

        document.addEventListener("mouseup", this.onMouseUpFunc);
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
        if (this.dragStart.distanceTo(this.dragEnd) > 2) {
            this.handleDragSelect();
        } else if (this.onDownPosition.distanceTo(this.onUpPosition) === 0) {
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

            this.setSelection([raycastedMesh]);
        } else {
            this.DeselectAll();
        }
    }

    private setSelection(
        raycastedMeshes: (THREE.Object3D<THREE.Object3DEventMap> &
            IBeamOsMesh<
                THREE.BufferGeometry<THREE.NormalBufferAttributes>,
                THREE.Material
            >)[]
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

    handleDrag() {
        // todo
    }

    private handleDragSelect() {
        const rect = this.domElement.getBoundingClientRect();
        const x1 = Math.min(this.dragStart.x, this.dragEnd.x) - rect.left;
        const y1 = Math.min(this.dragStart.y, this.dragEnd.y) - rect.top;
        const x2 = Math.max(this.dragStart.x, this.dragEnd.x) - rect.left;
        const y2 = Math.max(this.dragStart.y, this.dragEnd.y) - rect.top;

        // Get camera
        const camera = this.camera;

        // Select all objects whose bounding box projects into the rectangle
        const selected: (THREE.Object3D<THREE.Object3DEventMap> &
            IBeamOsMesh<
                THREE.BufferGeometry<THREE.NormalBufferAttributes>,
                THREE.Material
            >)[] = [];
        this.scene.traverse((obj) => {
            if (isBeamOsMesh(obj)) {
                const box = new THREE.Box3().setFromObject(
                    obj as unknown as THREE.Object3D
                );
                console.log("Bounding box:", box);
                if (box.isEmpty()) return;
                // Check all 8 corners
                const points = [
                    new THREE.Vector3(box.min.x, box.min.y, box.min.z),
                    new THREE.Vector3(box.min.x, box.min.y, box.max.z),
                    new THREE.Vector3(box.min.x, box.max.y, box.min.z),
                    new THREE.Vector3(box.min.x, box.max.y, box.max.z),
                    new THREE.Vector3(box.max.x, box.min.y, box.min.z),
                    new THREE.Vector3(box.max.x, box.min.y, box.max.z),
                    new THREE.Vector3(box.max.x, box.max.y, box.min.z),
                    new THREE.Vector3(box.max.x, box.max.y, box.max.z),
                ];
                let inRect = false;
                for (const p of points) {
                    p.project(camera);
                    // Convert from NDC to screen
                    const sx = ((p.x + 1) / 2) * rect.width;
                    const sy = ((-p.y + 1) / 2) * rect.height;
                    if (sx >= x1 && sx <= x2 && sy >= y1 && sy <= y2) {
                        inRect = true;
                        break;
                    }
                }
                console.log(
                    `Object ${obj.beamOsId} in rect: ${inRect}, box: ${box.min.x},${box.min.y},${box.min.z} to ${box.max.x},${box.max.y},${box.max.z}`
                );
                if (inRect) {
                    selected.push(obj);
                }
            }
        });
        if (selected.length === 0) {
            this.DeselectAll();
            return;
        }

        this.setSelection(selected);
    }

    private createFrustumFromScreenRect(
        minNDC: THREE.Vector2,
        maxNDC: THREE.Vector2,
        camera: THREE.Camera
    ): THREE.Frustum {
        // Create 8 points in NDC, unproject to world, then build a frustum
        const points = [
            new THREE.Vector3(minNDC.x, minNDC.y, -1),
            new THREE.Vector3(maxNDC.x, minNDC.y, -1),
            new THREE.Vector3(maxNDC.x, maxNDC.y, -1),
            new THREE.Vector3(minNDC.x, maxNDC.y, -1),
            new THREE.Vector3(minNDC.x, minNDC.y, 1),
            new THREE.Vector3(maxNDC.x, minNDC.y, 1),
            new THREE.Vector3(maxNDC.x, maxNDC.y, 1),
            new THREE.Vector3(minNDC.x, maxNDC.y, 1),
        ];
        for (const p of points) p.unproject(camera);
        const frustum = new THREE.Frustum();
        frustum.setFromProjectionMatrix(
            new THREE.Matrix4()
                .multiplyMatrices(
                    camera.projectionMatrix,
                    camera.matrixWorldInverse
                )
                .invert()
        );
        // This is a simplification; for more accurate selection, you may want to build a custom frustum from the 8 points
        return frustum;
    }

    private boxIntersectsFrustum(
        box: THREE.Box3,
        frustum: THREE.Frustum
    ): boolean {
        return frustum.intersectsBox(box);
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
