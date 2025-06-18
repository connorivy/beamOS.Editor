import {
    BeamOsObjectType,
    Element1dResponse,
    InternalNode,
    ModelResponse,
    NodeResponse,
    PointLoadResponse,
    Result,
} from "./EditorApi/EditorApiAlpha";
import {
    objectTypeToString,
    ResultFactory,
} from "./EditorApi/EditorApiAlphaExtensions";
import { EditorConfigurations } from "./EditorConfigurations";
import { BeamOsElement1d } from "./SceneObjects/BeamOsElement1d";
import { BeamOsInternalNode } from "./SceneObjects/BeamOsInternalNode";
import { BeamOsNode } from "./SceneObjects/BeamOsNode";
import { BeamOsNodeBase } from "./SceneObjects/BeamOsNodeBase";
import { BeamOsPointLoad } from "./SceneObjects/BeamOsPointLoad";

export class ModelDisplayer {
    constructor(
        private config: EditorConfigurations,
        private modelGroup: THREE.Group
    ) {}

    public async displayModel(modelResponse: ModelResponse): Promise<Result> {
        // Create all nodes first (they have no dependencies)
        if (modelResponse.nodes) {
            for (const node of modelResponse.nodes) {
                await this.createNode(node);
            }
        }
        console.log("Model response", modelResponse);

        // Prepare maps for quick lookup
        const internalNodesByElement1dId: Map<number, InternalNode[]> =
            new Map();
        modelResponse.internalNodes?.forEach((internalNode) => {
            if (!internalNodesByElement1dId.has(internalNode.element1dId)) {
                internalNodesByElement1dId.set(internalNode.element1dId, []);
            }
            internalNodesByElement1dId
                .get(internalNode.element1dId)!
                .push(internalNode);
        });
        console.log(
            "Internal nodes by element1dId",
            internalNodesByElement1dId
        );

        // Iteratively process element1ds and internal nodes until all are created or no progress
        const unprocessedElement1ds = new Set(modelResponse.element1ds ?? []);
        const unprocessedInternalNodes = new Set(
            modelResponse.internalNodes ?? []
        );
        let progress = true;
        while (
            progress &&
            (unprocessedElement1ds.size > 0 ||
                unprocessedInternalNodes.size > 0)
        ) {
            progress = false;
            // Try to process element1ds
            for (const element1d of Array.from(unprocessedElement1ds)) {
                let startNode =
                    this.tryGetObjectByBeamOsUniqueId<BeamOsNodeBase>(
                        BeamOsNode.beamOsObjectType,
                        element1d.startNodeId
                    ) ??
                    this.tryGetObjectByBeamOsUniqueId<BeamOsInternalNode>(
                        BeamOsInternalNode.beamOsObjectType,
                        element1d.startNodeId
                    );
                let endNode =
                    this.tryGetObjectByBeamOsUniqueId<BeamOsNodeBase>(
                        BeamOsNode.beamOsObjectType,
                        element1d.endNodeId
                    ) ??
                    this.tryGetObjectByBeamOsUniqueId<BeamOsInternalNode>(
                        BeamOsInternalNode.beamOsObjectType,
                        element1d.endNodeId
                    );
                if (startNode && endNode) {
                    await this.createElement1d(element1d);
                    // If there are internal nodes for this element1d, try to create them (if possible)
                    if (internalNodesByElement1dId.has(element1d.id)) {
                        for (const internalNode of internalNodesByElement1dId.get(
                            element1d.id
                        )!) {
                            // Only create if not already created
                            if (
                                !this.tryGetObjectByBeamOsUniqueId<BeamOsInternalNode>(
                                    BeamOsInternalNode.beamOsObjectType,
                                    internalNode.id
                                )
                            ) {
                                let element1dObj =
                                    this.tryGetObjectByBeamOsUniqueId<BeamOsElement1d>(
                                        BeamOsElement1d.beamOsObjectType,
                                        internalNode.element1dId
                                    );
                                if (element1dObj) {
                                    await this.createInternalNode(internalNode);
                                    unprocessedInternalNodes.delete(
                                        internalNode
                                    );
                                    progress = true;
                                }
                            }
                        }
                    }
                    unprocessedElement1ds.delete(element1d);
                    progress = true;
                }
            }
            // Try to process internal nodes whose element1d exists
            for (const internalNode of Array.from(unprocessedInternalNodes)) {
                let element1dObj =
                    this.tryGetObjectByBeamOsUniqueId<BeamOsElement1d>(
                        BeamOsElement1d.beamOsObjectType,
                        internalNode.element1dId
                    );
                if (element1dObj) {
                    await this.createInternalNode(internalNode);
                    unprocessedInternalNodes.delete(internalNode);
                    progress = true;
                }
            }
        }
        // Create point loads (they depend only on nodes)
        if (modelResponse.pointLoads) {
            for (const el of modelResponse.pointLoads) {
                await this.createPointLoad(el);
            }
        }
        return ResultFactory.Success();
    }

    createNodes(body: NodeResponse[]): Promise<Result> {
        body.forEach(async (el) => {
            await this.createNode(el);
        });

        return Promise.resolve(ResultFactory.Success());
    }
    createNode(nodeResponse: NodeResponse): Promise<Result> {
        let node = this.tryGetObjectByBeamOsUniqueId<BeamOsNode>(
            BeamOsNode.beamOsObjectType,
            nodeResponse.id
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

    createInternalNodes(body: InternalNode[]): Promise<Result> {
        body.forEach(async (el) => {
            await this.createInternalNode(el);
        });

        return Promise.resolve(ResultFactory.Success());
    }
    createInternalNode(nodeResponse: InternalNode): Promise<Result> {
        console.log("Creating internal node", nodeResponse);
        let element1d = this.getObjectByBeamOsUniqueId<BeamOsElement1d>(
            BeamOsElement1d.beamOsObjectType,
            nodeResponse.element1dId
        );
        let node = new BeamOsInternalNode(
            nodeResponse.id,
            element1d,
            nodeResponse.ratioAlongElement1d.value,
            nodeResponse.restraint,
            this.config.yAxisUp
        );

        this.addObject(node);
        return Promise.resolve(ResultFactory.Success());
    }

    createElement1ds(body: Element1dResponse[]): Promise<Result> {
        body.forEach(async (el) => {
            await this.createElement1d(el);
        });

        return Promise.resolve(ResultFactory.Success());
    }
    createElement1d(Element1dResponse: Element1dResponse): Promise<Result> {
        let startNode =
            this.tryGetObjectByBeamOsUniqueId<BeamOsNodeBase>(
                BeamOsNode.beamOsObjectType,
                Element1dResponse.startNodeId
            ) ??
            this.getObjectByBeamOsUniqueId<BeamOsInternalNode>(
                BeamOsInternalNode.beamOsObjectType,
                Element1dResponse.startNodeId
            );
        let endNode =
            this.tryGetObjectByBeamOsUniqueId<BeamOsNodeBase>(
                BeamOsNode.beamOsObjectType,
                Element1dResponse.endNodeId
            ) ??
            this.getObjectByBeamOsUniqueId<BeamOsInternalNode>(
                BeamOsInternalNode.beamOsObjectType,
                Element1dResponse.startNodeId
            );

        let el = new BeamOsElement1d(
            Element1dResponse.id,
            startNode,
            endNode,
            this.config.defaultElement1dMaterial
        );

        this.addObject(el);

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
            BeamOsNode.beamOsObjectType,
            body.nodeId
        );
        const pointLoad = new BeamOsPointLoad(body.id, node, body.direction);

        this.addObject(pointLoad);
        return Promise.resolve(ResultFactory.Success());
    }

    addObject(mesh: THREE.Mesh) {
        this.modelGroup.add(mesh);
    }

    getObjectByBeamOsUniqueId<TObject>(
        beamOsObjectType: BeamOsObjectType,
        entityId: number
    ): TObject {
        let beamOsUniqueId =
            objectTypeToString(beamOsObjectType) + entityId.toString();
        return (
            (this.modelGroup.getObjectByProperty(
                "beamOsUniqueId",
                beamOsUniqueId
            ) as TObject) ??
            this.throwExpression(
                "Could not find object with beamOsId " + beamOsUniqueId
            )
        );
    }

    tryGetObjectByBeamOsUniqueId<TObject>(
        beamOsObjectType: BeamOsObjectType,
        entityId: number
    ): TObject | null {
        let beamOsUniqueId =
            objectTypeToString(beamOsObjectType) + entityId.toString();
        return this.modelGroup.getObjectByProperty(
            "beamOsUniqueId",
            beamOsUniqueId
        ) as TObject;
    }

    throwExpression(errorMessage: string): never {
        throw new Error(errorMessage);
    }
}
