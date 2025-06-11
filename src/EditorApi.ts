import * as THREE from "three";
import {
    // AnalyticalResultsResponse,
    ChangeSelectionCommand,
    // ClearFilters,
    Element1dResponse,
    IEditorApiAlpha,
    ModelResponse,
    IModelEntity,
    // ModelResponseHydrated,
    // MomentDiagramResponse,
    MoveNodeCommand,
    NodeResponse,
    ModelSettings,
    PointLoadResponse,
    Result,
    DeflectionDiagramResponse,
    MomentDiagramResponse,
    ShearDiagramResponse,
    GlobalStresses,
    PutNodeClientCommand,
    ModelProposalResponse,
    BeamOsObjectType,
    // SetColorFilter,
    // ShearDiagramResponse,
} from "./EditorApi/EditorApiAlpha";
import { EditorConfigurations } from "./EditorConfigurations";
import { ResultFactory } from "./EditorApi/EditorApiAlphaExtensions";
import { BeamOsNode, BeamOsNodeProposal } from "./SceneObjects/BeamOsNode";
import {
    BeamOsElement1d,
    BeamOsElement1dProposal,
} from "./SceneObjects/BeamOsElement1d";
import { BeamOsPointLoad } from "./SceneObjects/BeamOsPointLoad";
import { BeamOsDiagram } from "./SceneObjects/BeamOsDiagram";
import { BeamOsDiagramByPoints } from "./SceneObjects/BeamOsDiagramByPoints";
import { ColorFilterBuilder } from "./ColorFilterer";
import { ModelProposalDisplayer } from "./ModelProposalDisplayer";
import { FilterStack } from "./FilterStack";
import { Controls } from "./Controls";
// import { BeamOsDiagram } from "./SceneObjects/BeamOsDiagram";
// import { IBeamOsMesh } from "./BeamOsMesh";

export class EditorApi implements IEditorApiAlpha {
    private currentModel: THREE.Group;
    private currentOverlay: THREE.Group;
    private currentProposal: THREE.Group;
    private gridGroup: THREE.Group | undefined;
    private currentFilterer: ColorFilterBuilder | undefined;
    private filterStack: FilterStack = new FilterStack();

    constructor(
        private camera: THREE.Camera,
        private controls: Controls,
        private sceneRoot: THREE.Group,
        private config: EditorConfigurations
    ) {
        this.currentModel = new THREE.Group();
        this.currentProposal = new THREE.Group();
        this.currentOverlay = new THREE.Group();
        this.sceneRoot.add(this.currentModel);
        this.sceneRoot.add(this.currentProposal);
        this.sceneRoot.add(this.currentOverlay);
    }

    updatePointLoad(body: PointLoadResponse): Promise<Result> {
        throw new Error("Method not implemented.");
    }
    updatePointLoads(body: PointLoadResponse[]): Promise<Result> {
        throw new Error("Method not implemented.");
    }
    async displayModelProposal(body: ModelProposalResponse): Promise<Result> {
        const proposalDisplayer = new ModelProposalDisplayer(
            this.config,
            this.currentProposal,
            this.currentModel,
            this.filterStack
        );

        await proposalDisplayer.displayModelProposal(body);
        return ResultFactory.Success();
    }
    clearModelProposals(): Promise<Result> {
        this.currentProposal.clear();
        return Promise.resolve(ResultFactory.Success());
    }
    reducePutNodeClientCommand(_body: PutNodeClientCommand): Promise<Result> {
        throw new Error("Method not implemented.");
    }
    clearCurrentOverlay(): Promise<Result> {
        this.currentOverlay.clear();
        return Promise.resolve(ResultFactory.Success());
    }

    clear(): Promise<Result> {
        this.currentModel.clear();
        this.currentOverlay.clear();
        this.currentProposal.clear();
        return Promise.resolve(ResultFactory.Success());
    }

    async createModel(modelResponse: ModelResponse): Promise<Result> {
        await this.clear();
        await this.setSettings(modelResponse.settings);
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

    createElement1ds(body: Element1dResponse[]): Promise<Result> {
        body.forEach(async (el) => {
            await this.createElement1d(el);
        });

        return Promise.resolve(ResultFactory.Success());
    }
    createElement1d(Element1dResponse: Element1dResponse): Promise<Result> {
        let startNode = this.sceneRoot.getObjectByProperty(
            "beamOsId",
            Element1dResponse.startNodeId
        ) as BeamOsNode;
        let endNode = this.sceneRoot.getObjectByProperty(
            "beamOsId",
            Element1dResponse.endNodeId
        ) as BeamOsNode;

        let el = new BeamOsElement1d(
            Element1dResponse.id,
            startNode,
            endNode,
            this.config.defaultElement1dMaterial
        );

        this.currentModel.add(el);

        return Promise.resolve(ResultFactory.Success());
    }

    updateElement1d(body: Element1dResponse): Promise<Result> {
        let existing = this.getObjectByBeamOsUniqueId<BeamOsElement1d>(
            BeamOsElement1d.beamOsObjectType + body.id
        );

        if (existing.startNode.beamOsId != body.startNodeId) {
            let startNode = this.getObjectByBeamOsUniqueId<BeamOsNode>(
                BeamOsNode.beamOsObjectType + body.startNodeId
            );
            existing.ReplaceStartNode(startNode);
        }
        if (existing.endNode.beamOsId != body.endNodeId) {
            let endNode = this.getObjectByBeamOsUniqueId<BeamOsNode>(
                BeamOsNode.beamOsObjectType + body.endNodeId
            );
            existing.ReplaceEndNode(endNode);
        }
        return Promise.resolve(ResultFactory.Success());
    }

    updateElement1ds(body: Element1dResponse[]): Promise<Result> {
        body.forEach(async (el) => {
            await this.updateElement1d(el);
        });

        return Promise.resolve(ResultFactory.Success());
    }

    deleteElement1d(body: IModelEntity): Promise<Result> {
        let el = this.getObjectByBeamOsUniqueId<BeamOsElement1d>(
            BeamOsElement1d.beamOsObjectType + body.id
        );

        this.removeObject3D(el);
        return Promise.resolve(ResultFactory.Success());
    }
    deleteElement1ds(body: IModelEntity[]): Promise<Result> {
        body.forEach(async (el) => {
            await this.deleteElement1d(el);
        });

        return Promise.resolve(ResultFactory.Success());
    }

    // async createModelHydrated(
    //     modelResponseHydrated: ModelResponseHydrated
    // ): Promise<Result> {
    //     modelResponseHydrated.nodes.forEach(async (node) => {
    //         await this.createNode(node);
    //     });
    //     modelResponseHydrated.element1Ds.forEach(async (element1d) => {
    //         await this.createElement1d(element1d);
    //     });
    //     return ResultFactory.Success();
    // }

    createNodes(body: NodeResponse[]): Promise<Result> {
        body.forEach(async (el) => {
            await this.createNode(el);
        });

        return Promise.resolve(ResultFactory.Success());
    }
    createNode(nodeResponse: NodeResponse): Promise<Result> {
        let node = this.tryGetObjectByBeamOsUniqueId<BeamOsNode>(
            BeamOsNode.beamOsObjectType + nodeResponse.id
        );

        if (node != null) {
            node.xCoordinate = nodeResponse.locationPoint.x;
            node.yCoordinate = nodeResponse.locationPoint.y;
            node.zCoordinate = nodeResponse.locationPoint.z;
            node.setMeshPositionFromCoordinates();
            node.firePositionChangedEvent();

            node.restraint = nodeResponse.restraint;
        } else {
            node = new BeamOsNode(
                nodeResponse.id,
                nodeResponse.locationPoint.x,
                nodeResponse.locationPoint.y,
                nodeResponse.locationPoint.z,
                nodeResponse.restraint,
                this.config.yAxisUp
            );

            this.addObject(node);
        }
        return Promise.resolve(ResultFactory.Success());
    }

    updateNode(body: NodeResponse): Promise<Result> {
        const nodeId = BeamOsNode.beamOsObjectType + body.id;
        let node = this.getObjectByBeamOsUniqueId<BeamOsNode>(nodeId);

        // Update existing node - position
        node.xCoordinate = body.locationPoint.x;
        node.yCoordinate = body.locationPoint.y;
        node.zCoordinate = body.locationPoint.z;
        node.setMeshPositionFromCoordinates();
        node.firePositionChangedEvent();

        // Update restraint - this will trigger geometry update
        node.restraint = body.restraint;

        return Promise.resolve(ResultFactory.Success());
    }

    updateNodes(body: NodeResponse[]): Promise<Result> {
        body.forEach(async (el) => {
            await this.updateNode(el);
        });

        return Promise.resolve(ResultFactory.Success());
    }

    deleteNode(body: IModelEntity): Promise<Result> {
        let el = this.getObjectByBeamOsUniqueId<BeamOsNode>(
            BeamOsNode.beamOsObjectType + body.id
        );

        this.removeObject3D(el);
        return Promise.resolve(ResultFactory.Success());
    }
    deleteNodes(body: IModelEntity[]): Promise<Result> {
        body.forEach(async (el) => {
            await this.deleteNode(el);
        });

        return Promise.resolve(ResultFactory.Success());
    }

    createPointLoads(body: PointLoadResponse[]): Promise<Result> {
        body.forEach(async (el) => {
            await this.createPointLoad(el);
        });

        return Promise.resolve(ResultFactory.Success());
    }

    createPointLoad(body: PointLoadResponse): Promise<Result> {
        const node = this.getObjectByBeamOsUniqueId<BeamOsNode>(
            BeamOsNode.beamOsObjectType + body.nodeId
        );
        const pointLoad = new BeamOsPointLoad(body.id, node, body.direction);

        this.addObject(pointLoad);
        return Promise.resolve(ResultFactory.Success());
    }

    deletePointLoad(body: IModelEntity): Promise<Result> {
        let el = this.getObjectByBeamOsUniqueId<BeamOsPointLoad>(
            BeamOsPointLoad.beamOsObjectType + body.id
        );

        this.removeObject3D(el);
        return Promise.resolve(ResultFactory.Success());
    }
    deletePointLoads(body: IModelEntity[]): Promise<Result> {
        body.forEach(async (el) => {
            await this.deletePointLoad(el);
        });

        return Promise.resolve(ResultFactory.Success());
    }

    createShearDiagrams(body: ShearDiagramResponse[]): Promise<Result> {
        this.currentOverlay.clear();
        body.forEach(async (diagram) => {
            await this.createShearDiagram(diagram);
        });

        return Promise.resolve(ResultFactory.Success());
    }

    createShearDiagram(body: ShearDiagramResponse): Promise<Result> {
        const el = this.getObjectByBeamOsUniqueId<BeamOsElement1d>(
            BeamOsElement1d.beamOsObjectType + body.element1dId
        );
        const shearDiagramResponse = new BeamOsDiagram(
            body.element1dId,
            body.intervals,
            el,
            this.config.yAxisUp,
            this.config.maxShearMagnitude
        );

        this.currentOverlay.add(shearDiagramResponse);
        return Promise.resolve(ResultFactory.Success());
    }

    createMomentDiagrams(body: MomentDiagramResponse[]): Promise<Result> {
        this.currentOverlay.clear();
        body.forEach(async (diagram) => {
            await this.createMomentDiagram(diagram);
        });

        return Promise.resolve(ResultFactory.Success());
    }

    createMomentDiagram(body: MomentDiagramResponse): Promise<Result> {
        const el = this.getObjectByBeamOsUniqueId<BeamOsElement1d>(
            BeamOsElement1d.beamOsObjectType + body.element1dId
        );
        const shearDiagramResponse = new BeamOsDiagram(
            body.element1dId,
            body.intervals,
            el,
            this.config.yAxisUp,
            this.config.maxMomentMagnitude
        );

        this.currentOverlay.add(shearDiagramResponse);
        return Promise.resolve(ResultFactory.Success());
    }

    createDeflectionDiagram(body: DeflectionDiagramResponse): Promise<Result> {
        const el = this.getObjectByBeamOsUniqueId<BeamOsElement1d>(
            BeamOsElement1d.beamOsObjectType + body.element1dId
        );
        const diagramResponse = new BeamOsDiagramByPoints(
            body.element1dId,
            el.startNode,
            el.endNode,
            body
        );

        this.currentOverlay.add(diagramResponse);
        return Promise.resolve(ResultFactory.Success());
    }
    createDeflectionDiagrams(
        body: DeflectionDiagramResponse[]
    ): Promise<Result> {
        this.currentOverlay.clear();
        body.forEach(async (diagram) => {
            await this.createDeflectionDiagram(diagram);
        });

        return Promise.resolve(ResultFactory.Success());
    }

    // setColorFilter(body: SetColorFilter): Promise<Result> {
    //     let ids: string[];
    //     if (!body.colorAllOthers) {
    //         ids = body.beamOsIds;
    //     } else {
    //         ids = [];
    //         this.currentModel.children.forEach((obj) => {
    //             const beamOsId = (<IBeamOsMesh>(<any>obj)).beamOsId;
    //             if (!body.beamOsIds.includes(beamOsId)) {
    //                 ids.push(beamOsId);
    //             }
    //         });
    //     }
    //     ids.forEach((id) => {
    //         const el = this.getObjectByBeamOsId<IBeamOsMesh>(id);
    //         el.SetColorFilter(parseInt(body.colorHex), body.ghost);
    //     });

    //     return Promise.resolve(ResultFactory.Success());
    // }

    // clearFilters(body: ClearFilters): Promise<Result> {
    //     let ids: string[];
    //     if (!body.colorAllOthers) {
    //         ids = body.beamOsIds;
    //     } else {
    //         ids = [];
    //         this.currentModel.children.forEach((obj) => {
    //             const beamOsId = (<IBeamOsMesh>(<any>obj)).beamOsId;
    //             if (!body.beamOsIds.includes(beamOsId)) {
    //                 ids.push(beamOsId);
    //             }
    //         });
    //     }
    //     ids.forEach((id) => {
    //         const el = this.getObjectByBeamOsId<IBeamOsMesh>(id);
    //         el.RemoveColorFilter();
    //     });

    //     return Promise.resolve(ResultFactory.Success());
    // }

    // setModelResults(body: AnalyticalResultsResponse): Promise<Result> {
    //     if (!body) {
    //         return Promise.resolve(ResultFactory.Success());
    //     }
    //     this.config.maxShearMagnitude = Math.max(
    //         body.maxShear.value,
    //         Math.abs(body.minShear.value)
    //     );
    //     this.config.maxMomentMagnitude = Math.max(
    //         body.maxMoment.value,
    //         Math.abs(body.minMoment.value)
    //     );
    //     return Promise.resolve(ResultFactory.Success());
    // }

    setGlobalStresses(body: GlobalStresses): Promise<Result> {
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

    setSettings(body: ModelSettings): Promise<Result> {
        // if (body.yAxisUp == this.config.yAxisUp) {
        //     return Promise.resolve(ResultFactory.Success());
        // }
        this.config.yAxisUp = body.yAxisUp;

        if (this.gridGroup !== undefined) {
            this.sceneRoot.remove(this.gridGroup);
        }

        this.gridGroup = new THREE.Group();
        if (body.yAxisUp) {
            this.camera.up.set(0, 1, 0);
        } else {
            this.camera.up.set(0, 0, 1);
            this.gridGroup.rotateX(Math.PI / 2);
        }
        this.controls.updateCameraUp();

        this.sceneRoot.add(this.gridGroup);

        const grid1 = new THREE.GridHelper(30, 30, 0x282828);
        grid1.material.color.setHex(0x282828);
        grid1.material.vertexColors = false;
        this.gridGroup.add(grid1);

        const grid2 = new THREE.GridHelper(30, 6, 0x888888);
        grid2.material.color.setHex(0x888888);
        grid2.material.vertexColors = false;
        this.gridGroup.add(grid2);

        return Promise.resolve(ResultFactory.Success());
    }

    reduceChangeSelectionCommand(
        _body: ChangeSelectionCommand
    ): Promise<Result> {
        throw new Error("Method not implemented.");
    }

    reduceMoveNodeCommand(body: MoveNodeCommand): Promise<Result> {
        let node = this.getObjectByBeamOsUniqueId<BeamOsNode>(
            BeamOsNode.beamOsObjectType + body.nodeId
        );

        node.position.x = body.newLocation.x;
        node.position.y = body.newLocation.y;
        node.position.z = body.newLocation.z;
        node.firePositionChangedEvent();

        return Promise.resolve(ResultFactory.Success());
    }

    addObject(mesh: THREE.Mesh) {
        this.currentModel.add(mesh);
    }

    addProposalObject(mesh: THREE.Mesh) {
        this.currentProposal.add(mesh);
    }

    getObjectByBeamOsUniqueId<TObject>(beamOsUniqueId: string): TObject {
        return (
            (this.currentModel.getObjectByProperty(
                "beamOsUniqueId",
                beamOsUniqueId
            ) as TObject) ??
            this.throwExpression(
                "Could not find object with beamOsId " + beamOsUniqueId
            )
        );
    }

    getProposalObjectByBeamOsUniqueId<TObject>(
        beamOsUniqueId: string
    ): TObject {
        return (
            (this.currentProposal.getObjectByProperty(
                "beamOsUniqueId",
                beamOsUniqueId
            ) as TObject) ??
            this.throwExpression(
                "Could not find object with beamOsId " + beamOsUniqueId
            )
        );
    }

    tryGetObjectByBeamOsUniqueId<TObject>(
        beamOsUniqueId: string
    ): TObject | null {
        return this.currentModel.getObjectByProperty(
            "beamOsUniqueId",
            beamOsUniqueId
        ) as TObject;
    }

    throwExpression(errorMessage: string): never {
        throw new Error(errorMessage);
    }

    removeObject3D(object3D: THREE.Mesh) {
        // if (!(object3D instanceof THREE.Mesh)) return false;

        // for better memory management and performance
        if (object3D.geometry) object3D.geometry.dispose();

        if (object3D.material) {
            if (object3D.material instanceof Array) {
                // for better memory management and performance
                object3D.material.forEach((material) => material.dispose());
            } else {
                // for better memory management and performance
                object3D.material.dispose();
            }
        }
        object3D.removeFromParent(); // the parent might be the scene or another Object3D, but it is sure to be removed this way
        object3D.geometry.attributes.position.needsUpdate = true;
        return true;
    }
}
