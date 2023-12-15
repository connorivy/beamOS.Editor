import * as THREE from 'three'
import { CreateElement1DRequest, CreateModelRequest, CreateNodeRequest, CreatePointLoadRequest, Element1DResponse, IPhysicalModelAlphaClient, ModelResponse, NodeResponse, PointLoadResponse } from "./PhysicalModelClient/PhysicalModelAlphaClient";

export class EditorApi implements IPhysicalModelAlphaClient {

    constructor(public scene: THREE.Scene) {

    }

    addObject(mesh: THREE.Mesh) {
        this.scene.add(mesh);
    }

    getApiModelsElement1Ds(_modelId: string, _element1dIds: string[] | null | undefined): Promise<Element1DResponse[]> {
        throw new Error("Method not implemented.");
    }
    getApiModels(_id: string, _sendEntities: boolean | null | undefined): Promise<ModelResponse> {
        throw new Error("Method not implemented.");
    }
    createPointLoad(_createPointLoadRequest: CreatePointLoadRequest): Promise<PointLoadResponse> {
        throw new Error("Method not implemented.");
    }
    async createNode(createNodeRequest: CreateNodeRequest): Promise<NodeResponse> {
        const geometry = new THREE.SphereGeometry(.1);
        const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
        mesh.position.set(
            createNodeRequest.xCoordinate, 
            createNodeRequest.yCoordinate, 
            createNodeRequest.zCoordinate)

        this.addObject(mesh);
        return new NodeResponse();
    }
    getSingleNode(_id: string | null): Promise<NodeResponse> {
        throw new Error("Method not implemented.");
    }
    createModel(_createModelRequest: CreateModelRequest): Promise<ModelResponse> {
        throw new Error("Method not implemented.");
    }
    createElement1d(_createElement1DRequest: CreateElement1DRequest): Promise<Element1DResponse> {
        throw new Error("Method not implemented.");
    }
    getSingleElement1d(_id: string | null): Promise<Element1DResponse> {
        throw new Error("Method not implemented.");
    }

}