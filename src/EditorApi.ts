import * as THREE from "three";
import {
    ChangeSelectionCommand,
    ClearFilters,
    Element1DResponse,
    IEditorApiAlpha,
    ModelResponse,
    ModelResponseHydrated,
    ModelResultResponse,
    MomentDiagramResponse,
    MoveNodeCommand,
    NodeResponse,
    PhysicalModelSettings,
    PointLoadResponse,
    Result,
    SetColorFilter,
    ShearDiagramResponse,
} from "./EditorApi/EditorApiAlpha";
import { EditorConfigurations } from "./EditorConfigurations";
import { ResultFactory } from "./EditorApi/EditorApiAlphaExtensions";
import { BeamOsNode } from "./SceneObjects/BeamOsNode";
import { BeamOsElement1d } from "./SceneObjects/BeamOsElement1d";
import { BeamOsPointLoad } from "./SceneObjects/BeamOsPointLoad";
import { BeamOsDiagram } from "./SceneObjects/BeamOsDiagram";
import { IBeamOsMesh } from "./BeamOsMesh";

export class EditorApi implements IEditorApiAlpha {
    private currentModel: THREE.Group;

    constructor(
        private sceneRoot: THREE.Group,
        private config: EditorConfigurations
    ) {
        this.currentModel = new THREE.Group();
        this.sceneRoot.add(this.currentModel);
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

    createElement1ds(body: Element1DResponse[]): Promise<Result> {
        body.forEach(async (el) => {
            await this.createElement1d(el);
        });

        return Promise.resolve(ResultFactory.Success());
    }
    createElement1d(element1DResponse: Element1DResponse): Promise<Result> {
        let startNode = this.sceneRoot.getObjectByProperty(
            "beamOsId",
            element1DResponse.startNodeId
        ) as BeamOsNode;
        let endNode = this.sceneRoot.getObjectByProperty(
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

        return Promise.resolve(ResultFactory.Success());
    }

    async createModelHydrated(
        modelResponseHydrated: ModelResponseHydrated
    ): Promise<Result> {
        modelResponseHydrated.nodes.forEach(async (node) => {
            await this.createNode(node);
        });
        modelResponseHydrated.element1Ds.forEach(async (element1d) => {
            await this.createElement1d(element1d);
        });
        return ResultFactory.Success();
    }

    createNodes(body: NodeResponse[]): Promise<Result> {
        body.forEach(async (el) => {
            await this.createNode(el);
        });

        return Promise.resolve(ResultFactory.Success());
    }
    createNode(nodeResponse: NodeResponse): Promise<Result> {
        let node = this.sceneRoot.getObjectByProperty(
            "beamOsId",
            nodeResponse.id
        ) as BeamOsNode;

        if (node != null) {
            node.xCoordinate = nodeResponse.locationPoint.xCoordinate;
            node.yCoordinate = nodeResponse.locationPoint.yCoordinate;
            node.zCoordinate = nodeResponse.locationPoint.zCoordinate;
            node.setMeshPositionFromCoordinates();
            node.firePositionChangedEvent();

            node.restraint = nodeResponse.restraint;
        } else {
            node = new BeamOsNode(
                nodeResponse.id,
                nodeResponse.locationPoint.xCoordinate,
                nodeResponse.locationPoint.yCoordinate,
                nodeResponse.locationPoint.zCoordinate,
                nodeResponse.restraint,
                this.config.yAxisUp
            );

            this.addObject(node);
        }
        return Promise.resolve(ResultFactory.Success());
    }

    createPointLoads(body: PointLoadResponse[]): Promise<Result> {
        body.forEach(async (el) => {
            await this.createPointLoad(el);
        });

        return Promise.resolve(ResultFactory.Success());
    }

    createPointLoad(body: PointLoadResponse): Promise<Result> {
        const node = this.getObjectByBeamOsId<BeamOsNode>(body.nodeId);
        const pointLoad = new BeamOsPointLoad(body.id, node, body.direction);

        this.addObject(pointLoad);
        return Promise.resolve(ResultFactory.Success());
    }

    createShearDiagrams(body: ShearDiagramResponse[]): Promise<Result> {
        body.forEach(async (diagram) => {
            await this.createShearDiagram(diagram);
        });

        return Promise.resolve(ResultFactory.Success());
    }

    createShearDiagram(body: ShearDiagramResponse): Promise<Result> {
        const el = this.getObjectByBeamOsId<BeamOsElement1d>(body.element1DId);
        const shearDiagramResponse = new BeamOsDiagram(
            body.id,
            body.intervals,
            el,
            this.config.yAxisUp,
            this.config.maxShearMagnitude
        );

        this.addObject(shearDiagramResponse);
        return Promise.resolve(ResultFactory.Success());
    }

    createMomentDiagrams(body: MomentDiagramResponse[]): Promise<Result> {
        body.forEach(async (diagram) => {
            await this.createMomentDiagram(diagram);
        });

        return Promise.resolve(ResultFactory.Success());
    }

    createMomentDiagram(body: MomentDiagramResponse): Promise<Result> {
        const el = this.getObjectByBeamOsId<BeamOsElement1d>(body.element1DId);
        const shearDiagramResponse = new BeamOsDiagram(
            body.id,
            body.intervals,
            el,
            this.config.yAxisUp,
            this.config.maxMomentMagnitude
        );

        this.addObject(shearDiagramResponse);
        return Promise.resolve(ResultFactory.Success());
    }

    setColorFilter(body: SetColorFilter): Promise<Result> {
        let ids: string[];
        if (!body.colorAllOthers) {
            ids = body.beamOsIds;
        } else {
            ids = [];
            this.currentModel.children.forEach((obj) => {
                const beamOsId = (<IBeamOsMesh>(<any>obj)).beamOsId;
                if (!body.beamOsIds.includes(beamOsId)) {
                    ids.push(beamOsId);
                }
            });
        }
        ids.forEach((id) => {
            const el = this.getObjectByBeamOsId<IBeamOsMesh>(id);
            el.SetColorFilter(parseInt(body.colorHex), body.ghost);
        });

        return Promise.resolve(ResultFactory.Success());
    }

    clearFilters(body: ClearFilters): Promise<Result> {
        let ids: string[];
        if (!body.colorAllOthers) {
            ids = body.beamOsIds;
        } else {
            ids = [];
            this.currentModel.children.forEach((obj) => {
                const beamOsId = (<IBeamOsMesh>(<any>obj)).beamOsId;
                if (!body.beamOsIds.includes(beamOsId)) {
                    ids.push(beamOsId);
                }
            });
        }
        ids.forEach((id) => {
            const el = this.getObjectByBeamOsId<IBeamOsMesh>(id);
            el.RemoveColorFilter();
        });

        return Promise.resolve(ResultFactory.Success());
    }

    setModelResults(body: ModelResultResponse): Promise<Result> {
        this.config.maxShearMagnitude = Math.max(
            body.maxShear.value,
            Math.abs(body.minShear.value)
        );
        this.config.maxMomentMagnitude = Math.max(
            body.maxMoment.value,
            Math.abs(body.minMoment.value)
        );
        return Promise.resolve(ResultFactory.Success());
    }

    setSettings(body: PhysicalModelSettings): Promise<Result> {
        if (body.yAxisUp == this.config.yAxisUp) {
            return Promise.resolve(ResultFactory.Success());
        }
        this.config.yAxisUp = body.yAxisUp;

        if (body.yAxisUp) {
            this.sceneRoot.rotateX(Math.PI / 2);
            this.sceneRoot.up = new THREE.Vector3(0, 1, 0);
        } else {
            this.sceneRoot.rotateX(-Math.PI / 2);
            this.sceneRoot.up = new THREE.Vector3(0, 0, 1);
        }

        return Promise.resolve(ResultFactory.Success());
    }

    reduceChangeSelectionCommand(
        _body: ChangeSelectionCommand
    ): Promise<Result> {
        throw new Error("Method not implemented.");
    }

    reduceMoveNodeCommand(body: MoveNodeCommand): Promise<Result> {
        let node = this.sceneRoot.getObjectByProperty(
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
