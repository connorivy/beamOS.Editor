import * as THREE from "three";
import { BeamOsMesh } from "./BeamOsMesh";
import {
    Element1DResponse,
    IEditorApiAlpha,
    ModelResponse,
    ModelResponseHydrated,
    NodeResponse,
    Result,
} from "./EditorApi/EditorApiAlpha";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { EditorConfigurations } from "./EditorConfigurations";
import { ResultFactory } from "./EditorApi/EditorApiAlphaExtensions";

export class EditorApi implements IEditorApiAlpha {
    private currentModel: THREE.Group;

    constructor(
        private scene: THREE.Scene,
        private config: EditorConfigurations
    ) {
        this.currentModel = new THREE.Group();
        this.scene.add(this.currentModel);
    }

    async clear(): Promise<Result> {
        this.currentModel.clear();
        return ResultFactory.Success();
    }
    async createModel(modelResponse: ModelResponse): Promise<Result> {
        modelResponse.nodes?.forEach(async (node) => {
            await this.createNode(node);
        });
        modelResponse.element1ds?.forEach(async (element1d) => {
            await this.createElement1d(element1d);
        });
        return ResultFactory.Success();
    }

    async createElement1d(
        element1DResponse: Element1DResponse
    ): Promise<Result> {
        console.log("createElement1d", element1DResponse);
        let startNode = this.scene.getObjectByProperty(
            "beamOsId",
            element1DResponse.startNodeId
        ) as BeamOsMesh;
        let endNode = this.scene.getObjectByProperty(
            "beamOsId",
            element1DResponse.endNodeId
        ) as BeamOsMesh;

        const lineGeometry = new LineGeometry();
        lineGeometry.setPositions([
            startNode.position.x,
            startNode.position.y,
            startNode.position.z,
            endNode.position.x,
            endNode.position.y,
            endNode.position.z,
        ]);

        let line = new Line2(
            lineGeometry,
            this.config.defaultElement1dMaterial
        );
        line.computeLineDistances();
        line.scale.set(1, 1, 1);
        this.currentModel.add(line);

        return ResultFactory.Success();
    }

    async createModelHydrated(
        modelResponseHydrated: ModelResponseHydrated
    ): Promise<Result> {
        console.log("createModelHydrated", modelResponseHydrated);
        modelResponseHydrated.nodes.forEach(async (node) => {
            await this.createNode(node);
        });
        modelResponseHydrated.element1Ds.forEach(async (element1d) => {
            await this.createElement1d(element1d);
        });
        return ResultFactory.Success();
    }

    async createNode(nodeResponse: NodeResponse): Promise<Result> {
        console.log("createNode", nodeResponse);
        const geometry = new THREE.SphereGeometry(0.1);
        const mesh = new BeamOsMesh(
            nodeResponse.id,
            geometry,
            new THREE.MeshStandardMaterial()
        );
        mesh.position.set(
            nodeResponse.locationPoint.xCoordinate.value,
            nodeResponse.locationPoint.yCoordinate.value,
            nodeResponse.locationPoint.zCoordinate.value
        );

        this.addObject(mesh);
        return ResultFactory.Success();
    }

    addObject(mesh: THREE.Mesh) {
        this.currentModel.add(mesh);
    }
}
