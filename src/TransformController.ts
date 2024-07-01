import * as THREE from "three";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import {
    EditorLocation,
    IEditorEventsApi,
    NodeMovedEvent,
} from "./EditorApi/EditorEventsApi";
import { BeamOsNode } from "./SceneObjects/BeamOsNode";

export class TransformController {
    public transformControl: TransformControls;
    private startLocation: EditorLocation | undefined;
    private node: BeamOsNode;

    constructor(
        scene: THREE.Scene,
        camera: THREE.Camera,
        domElement: HTMLElement,
        private controls: OrbitControls,
        private dispatcher: IEditorEventsApi
    ) {
        this.transformControl = new TransformControls(camera, domElement);
        scene.add(this.transformControl);

        this.node = this.transformControl.object as BeamOsNode;

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

            await this.dispatcher.handleNodeMovedEvent(
                new NodeMovedEvent({
                    nodeId: event.target.object.beamOsId,
                    previousLocation: this.startLocation,
                    newLocation: new EditorLocation({
                        xCoordinate: event.target.object.position.x,
                        yCoordinate: event.target.object.position.y,
                        zCoordinate: event.target.object.position.z,
                    }),
                })
            );

            this.startLocation = undefined;
        } else {
            this.startLocation = new EditorLocation({
                xCoordinate: event.target.object.position.x,
                yCoordinate: event.target.object.position.y,
                zCoordinate: event.target.object.position.z,
            });
        }
    }

    onObjectChanged(event: any) {
        (this.transformControl.object as BeamOsNode).firePositionChangedEvent();
    }
}
