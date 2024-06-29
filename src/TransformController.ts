import * as THREE from "three";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { IEditorEventsApi, NodeMovedEvent } from "./EditorApi/EditorEventsApi";

export class TransformController {
    public transformControl: TransformControls;

    constructor(
        scene: THREE.Scene,
        camera: THREE.Camera,
        domElement: HTMLElement,
        private controls: OrbitControls,
        private dispatcher: IEditorEventsApi
    ) {
        this.transformControl = new TransformControls(camera, domElement);
        scene.add(this.transformControl);

        this.transformControl.addEventListener(
            "dragging-changed",
            this.onDraggingChanged.bind(this)
        );
    }

    async onDraggingChanged(event: any) {
        this.controls.enabled = !event.value;

        if (!event.value) {
            await this.dispatcher.handleNodeMovedEvent(
                new NodeMovedEvent({
                    nodeId: event.target.object.beamOsId,
                    xCoordinate: event.target.object.position.x,
                    yCoordinate: event.target.object.position.y,
                    zCoordinate: event.target.object.position.z,
                })
            );

            // await (<any>this.dispatcher).invokeMethodAsync(
            //     "handleNodeMovedEvent",
            //     new NodeMovedEvent({
            //         nodeId: event.target.object.beamOsId,
            //         xCoordinate: event.target.object.position.x,
            //         yCoordinate: event.target.object.position.y,
            //         zCoordinate: event.target.object.position.z,
            //     })
            // );
            // console.log(event.target.object.position);
        }
    }
}
