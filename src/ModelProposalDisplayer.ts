import { ColorFilterBuilder } from "./ColorFilterer";
import {
    BeamOsObjectType,
    DeleteModelEntityProposal,
    ModelProposalResponse,
    Result,
} from "./EditorApi/EditorApiAlpha";
import { ResultFactory } from "./EditorApi/EditorApiAlphaExtensions";
import { EditorConfigurations } from "./EditorConfigurations";
import {
    BeamOsElement1d,
    BeamOsElement1dProposal,
} from "./SceneObjects/BeamOsElement1d";
import { BeamOsNode, BeamOsNodeProposal } from "./SceneObjects/BeamOsNode";
import { FilterStack } from "./FilterStack";

export class ModelProposalDisplayer {
    constructor(
        private config: EditorConfigurations,
        private proposalGroup: THREE.Group,
        private modelGroup: THREE.Group,
        private filterStack: FilterStack
    ) {}

    public displayModelProposal(body: ModelProposalResponse): Promise<Result> {
        console.log("displayModelProposal", body);
        const filterer = new ColorFilterBuilder();

        for (const el of body.deleteModelEntityProposals ?? []) {
            this.displayEntityAsRemoved(el, filterer);
        }
        for (const node of body.createNodeProposals ?? []) {
            var newNode = new BeamOsNodeProposal(
                undefined,
                node.id,
                node.locationPoint.x,
                node.locationPoint.y,
                node.locationPoint.z,
                node.restraint,
                this.config.yAxisUp
            );
            filterer.add(
                newNode,
                this.config.createNodeProposalHex,
                false,
                true
            );

            this.addProposalObject(newNode);
        }
        // create dictionary of nodeProposals
        const nodeProposalsDict: { [key: string]: BeamOsNodeProposal } = {};
        for (const node of body.modifyNodeProposals ?? []) {
            var existingNode = this.getObjectByBeamOsUniqueId<BeamOsNode>(
                BeamOsNode.beamOsObjectType + node.existingNodeId
            );
            filterer.add(
                existingNode,
                this.config.createNodeProposalHex,
                true,
                true
            );

            var newNode = new BeamOsNodeProposal(
                existingNode.beamOsId,
                node.id,
                node.locationPoint.x,
                node.locationPoint.y,
                node.locationPoint.z,
                node.restraint,
                this.config.yAxisUp
            );
            filterer.add(
                newNode,
                this.config.modifyNodeProposalHexNew,
                false,
                true
            );
            nodeProposalsDict[existingNode.beamOsId] = newNode;
            this.addProposalObject(newNode);
        }

        for (const el of body.createElement1dProposals ?? []) {
            let startNode: BeamOsNode;
            if (el.startNodeId.existingId != undefined) {
                startNode = this.getObjectByBeamOsUniqueId<BeamOsNode>(
                    BeamOsNode.beamOsObjectType + el.startNodeId.existingId
                );
            } else if (el.startNodeId.proposedId != undefined) {
                startNode = this.getProposalObjectByBeamOsUniqueId<BeamOsNode>(
                    BeamOsNodeProposal.beamOsObjectType +
                        el.startNodeId.proposedId
                );
            } else {
                throw new Error(
                    "startNodeId.existingId or startNodeId.proposedId must be defined"
                );
            }

            let endNode: BeamOsNode;
            if (el.endNodeId.existingId != undefined) {
                endNode = this.getObjectByBeamOsUniqueId<BeamOsNode>(
                    BeamOsNode.beamOsObjectType + el.endNodeId.existingId
                );
            } else if (el.endNodeId.proposedId != undefined) {
                endNode = this.getProposalObjectByBeamOsUniqueId<BeamOsNode>(
                    BeamOsNodeProposal.beamOsObjectType +
                        el.endNodeId.proposedId
                );
            } else {
                throw new Error(
                    "startNodeId.existingId or startNodeId.proposedId must be defined"
                );
            }

            var newElement1d = new BeamOsElement1dProposal(
                undefined,
                el.id,
                startNode,
                endNode,
                this.config.defaultElement1dMaterial
            );
            filterer.add(
                newElement1d,
                this.config.createElement1dProposalHex,
                false,
                true
            );

            this.addProposalObject(newElement1d);
        }

        for (const el of body.modifyElement1dProposals ?? []) {
            // Find the existing element
            const existingElement =
                this.getObjectByBeamOsUniqueId<BeamOsElement1d>(
                    BeamOsElement1d.beamOsObjectType + el.existingElement1dId
                );

            // Find the start and end nodes for the proposal
            let startNode: BeamOsNode;
            if (el.startNodeId.existingId != undefined) {
                if (nodeProposalsDict[el.startNodeId.existingId]) {
                    startNode = nodeProposalsDict[el.startNodeId.existingId];
                } else {
                    startNode = this.getObjectByBeamOsUniqueId<BeamOsNode>(
                        BeamOsNode.beamOsObjectType + el.startNodeId.existingId
                    );
                }
            } else if (el.startNodeId.proposedId != undefined) {
                startNode = this.getProposalObjectByBeamOsUniqueId<BeamOsNode>(
                    BeamOsNodeProposal.beamOsObjectType +
                        el.startNodeId.proposedId
                );
            } else {
                throw new Error(
                    "startNodeId.existingId or startNodeId.proposedId must be defined"
                );
            }

            let endNode: BeamOsNode;
            if (el.endNodeId.existingId != undefined) {
                if (nodeProposalsDict[el.endNodeId.existingId]) {
                    endNode = nodeProposalsDict[el.endNodeId.existingId];
                } else {
                    endNode = this.getObjectByBeamOsUniqueId<BeamOsNode>(
                        BeamOsNode.beamOsObjectType + el.endNodeId.existingId
                    );
                }
            } else if (el.endNodeId.proposedId != undefined) {
                endNode = this.getProposalObjectByBeamOsUniqueId<BeamOsNode>(
                    BeamOsNodeProposal.beamOsObjectType +
                        el.endNodeId.proposedId
                );
            } else {
                throw new Error(
                    "endNodeId.existingId or endNodeId.proposedId must be defined"
                );
            }

            // Compare properties for diff
            const startNodeChanged =
                existingElement.startNode.beamOsId !== startNode.beamOsId;
            const endNodeChanged =
                existingElement.endNode.beamOsId !== endNode.beamOsId;

            // Highlight the existing element (ghost it)
            filterer.add(
                existingElement,
                this.config.modifyElement1dProposalHexExisting,
                true,
                true
            );

            // Create the proposal element (new state)
            const newElement1dProposal = new BeamOsElement1dProposal(
                existingElement.beamOsId,
                el.id,
                startNode,
                endNode,
                this.config.defaultElement1dMaterial // or el.material if available
            );

            // Set color filter based on what changed
            if (startNodeChanged || endNodeChanged) {
                filterer.add(
                    newElement1dProposal,
                    this.config.modifyNodeProposalHexNew,
                    false,
                    true
                );
            } else {
                filterer.add(
                    newElement1dProposal,
                    this.config.createElement1dProposalHex,
                    false,
                    true
                );
            }

            this.addProposalObject(newElement1dProposal);
        }

        for (const id of body.element1dsModifiedBecauseOfNodeChange ?? []) {
            // Find the existing element
            const existingElement =
                this.getObjectByBeamOsUniqueId<BeamOsElement1d>(
                    BeamOsElement1d.beamOsObjectType + id
                );

            // Highlight the existing element (ghost it)
            filterer.add(
                existingElement,
                this.config.modifyElement1dProposalHexExisting,
                true,
                true
            );

            let startNode =
                nodeProposalsDict[existingElement.startNode.beamOsId] ??
                this.getObjectByBeamOsUniqueId<BeamOsNode>(
                    BeamOsNode.beamOsObjectType +
                        existingElement.startNode.beamOsId
                );
            let endNode =
                nodeProposalsDict[existingElement.endNode.beamOsId] ??
                this.getObjectByBeamOsUniqueId<BeamOsNode>(
                    BeamOsNode.beamOsObjectType +
                        existingElement.endNode.beamOsId
                );

            // Create the proposal element (new state)
            const newElement1dProposal = new BeamOsElement1dProposal(
                existingElement.beamOsId,
                id,
                startNode,
                endNode,
                this.config.defaultElement1dMaterial // or el.material if available
            );
            filterer.add(
                newElement1dProposal,
                this.config.modifyNodeProposalHexNew,
                false,
                true
            );

            this.addProposalObject(newElement1dProposal);
        }

        filterer.apply();
        this.filterStack.push(filterer);

        return Promise.resolve(ResultFactory.Success());
    }

    private displayEntityAsRemoved(
        el: DeleteModelEntityProposal,
        filterer: ColorFilterBuilder
    ) {
        if (el.objectType == BeamOsObjectType._3) {
            // element1d
            const existingElement =
                this.getObjectByBeamOsUniqueId<BeamOsElement1d>(
                    BeamOsElement1d.beamOsObjectType + el.modelEntityId
                );
            filterer.add(
                existingElement,
                this.config.removeElement1dProposalHex,
                false,
                true
            );
        } else if (el.objectType == BeamOsObjectType._2) {
            // node
            const existingNode = this.getObjectByBeamOsUniqueId<BeamOsNode>(
                BeamOsNode.beamOsObjectType + el.modelEntityId
            );
            filterer.add(
                existingNode,
                this.config.removeNodeProposalHex,
                false,
                true
            );
        }
    }

    addProposalObject(mesh: THREE.Mesh) {
        this.proposalGroup.add(mesh);
    }

    getObjectByBeamOsUniqueId<TObject>(beamOsUniqueId: string): TObject {
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

    getProposalObjectByBeamOsUniqueId<TObject>(
        beamOsUniqueId: string
    ): TObject {
        return (
            (this.proposalGroup.getObjectByProperty(
                "beamOsUniqueId",
                beamOsUniqueId
            ) as TObject) ??
            this.throwExpression(
                "Could not find object with beamOsId " + beamOsUniqueId
            )
        );
    }

    throwExpression(errorMessage: string): never {
        throw new Error(errorMessage);
    }
}
