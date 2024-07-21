import * as THREE from "three";
import {
    ChangeSelectionCommand,
    Element1DResponse,
    IEditorApiAlpha,
    ModelResponse,
    ModelResponseHydrated,
    MomentDiagramResponse,
    MoveNodeCommand,
    NodeResponse,
    PointLoadResponse,
    Result,
    ShearDiagramResponse,
} from "./EditorApi/EditorApiAlpha";
import { EditorConfigurations } from "./EditorConfigurations";
import { ResultFactory } from "./EditorApi/EditorApiAlphaExtensions";
import { BeamOsNode } from "./SceneObjects/BeamOsNode";
import { BeamOsElement1d } from "./SceneObjects/BeamOsElement1d";
import { BeamOsPointLoad } from "./SceneObjects/BeamOsPointLoad";
import { BeamOsDiagram } from "./SceneObjects/BeamOsDiagram";

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
        modelResponse.pointLoads?.forEach(async (el) => {
            await this.createPointLoad(el);
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
        ) as BeamOsNode;
        let endNode = this.scene.getObjectByProperty(
            "beamOsId",
            element1DResponse.endNodeId
        ) as BeamOsNode;

        let el = new BeamOsElement1d(
            element1DResponse.id,
            startNode,
            endNode,
            this.config.defaultElement1dMaterial
        );

        this.currentModel.add(el);

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

    createNode(nodeResponse: NodeResponse): Promise<Result> {
        console.log("createNode", nodeResponse);
        const node = new BeamOsNode(
            nodeResponse.id,
            nodeResponse.locationPoint.xCoordinate.value,
            nodeResponse.locationPoint.yCoordinate.value,
            nodeResponse.locationPoint.zCoordinate.value,
            nodeResponse.restraint
        );

        this.addObject(node);
        return Promise.resolve(ResultFactory.Success());
    }

    createPointLoad(body: PointLoadResponse): Promise<Result> {
        console.log("createPointLoad", body);

        const node = this.getObjectByBeamOsId<BeamOsNode>(body.nodeId);
        const pointLoad = new BeamOsPointLoad(body.id, node, body.direction);

        this.addObject(pointLoad);
        return Promise.resolve(ResultFactory.Success());
    }

    createShearDiagram(body: ShearDiagramResponse): Promise<Result> {
        const el = this.getObjectByBeamOsId<BeamOsElement1d>(body.element1DId);
        const shearDiagramResponse = new BeamOsDiagram(
            body.id,
            body.intervals,
            el
        );

        this.addObject(shearDiagramResponse);
        return Promise.resolve(ResultFactory.Success());
    }

    createMomentDiagram(body: MomentDiagramResponse): Promise<Result> {
        const el = this.getObjectByBeamOsId<BeamOsElement1d>(body.element1DId);
        const shearDiagramResponse = new BeamOsDiagram(
            body.id,
            body.intervals,
            el
        );

        this.addObject(shearDiagramResponse);
        return Promise.resolve(ResultFactory.Success());
    }

    reduceChangeSelectionCommand(
        _body: ChangeSelectionCommand
    ): Promise<Result> {
        throw new Error("Method not implemented.");
    }

    reduceMoveNodeCommand(body: MoveNodeCommand): Promise<Result> {
        let node = this.scene.getObjectByProperty(
            "beamOsId",
            body.nodeId
        ) as BeamOsNode;
        node.position.x = body.newLocation.x;
        node.position.y = body.newLocation.y;
        node.position.z = body.newLocation.z;
        node.firePositionChangedEvent();

        return Promise.resolve(ResultFactory.Success());
    }

    addObject(mesh: THREE.Mesh) {
        this.currentModel.add(mesh);
    }

    getObjectByBeamOsId<TObject>(beamOsId: string): TObject {
        return (
            (this.currentModel.getObjectByProperty(
                "beamOsId",
                beamOsId
            ) as TObject) ??
            this.throwExpression(
                "Could not find object with beamOsId " + beamOsId
            )
        );
    }

    throwExpression(errorMessage: string): never {
        throw new Error(errorMessage);
    }
}
