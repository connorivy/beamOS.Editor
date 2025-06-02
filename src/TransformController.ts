import * as THREE from "three";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import {
    Coordinate3D,
    IEditorEventsApi,
    MoveNodeCommand,
} from "./EditorApi/EditorEventsApi";
import { BeamOsNode } from "./SceneObjects/BeamOsNode";
import CameraControls from "camera-controls";

export class TransformController {
    public transformControl: TransformControls;
    private startLocation: Coordinate3D | undefined;

    constructor(
        scene: THREE.Scene,
        camera: THREE.Camera,
        private domElement: HTMLElement,
        private controls: CameraControls,
        private dispatcher: IEditorEventsApi
    ) {
        this.transformControl = new TransformControls(camera, domElement);
        scene.add(this.transformControl);

        this.transformControl.addEventListener(
            "dragging-changed",
            this.onDraggingChanged.bind(this)
        );

        this.transformControl.addEventListener(
            "objectChange",
            this.onObjectChanged.bind(this)
        );
    }

    async onDraggingChanged(event: any) {
        this.controls.enabled = !event.value;

        if (!event.value) {
            if (this.startLocation === undefined) {
                throw new Error("start location is undefined");
            }

            await this.dispatcher.dispatchMoveNodeCommand(
                new MoveNodeCommand({
                    canvasId: this.domElement.id,
                    nodeId: event.target.object.beamOsId,
                    previousLocation: this.startLocation,
                    newLocation: new Coordinate3D({
                        x: event.target.object.position.x,
                        y: event.target.object.position.y,
                        z: event.target.object.position.z,
                    }),
                    handledByBlazor: false,
                    handledByEditor: true,
                    handledByServer: false
                })
            );

            this.startLocation = undefined;
        } else {
            this.startLocation = new Coordinate3D({
                x: event.target.object.position.x,
                y: event.target.object.position.y,
                z: event.target.object.position.z,
            });
        }
    }

    onObjectChanged(_event: any) {
        (this.transformControl.object as BeamOsNode).firePositionChangedEvent();
    }
}
