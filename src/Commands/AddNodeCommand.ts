import * as THREE from 'three'
import { NodeResponse } from "../PhysicalModel.Contracts/NodeResponse";
import { Commands } from './Commands';

export function addNodeCommand(this: Commands, nodeResponse: NodeResponse) {
    const geometry = new THREE.SphereGeometry(.1);
    const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
    mesh.position.set(
        nodeResponse.locationPoint.xCoordinate.value, 
        nodeResponse.locationPoint.yCoordinate.value, 
        nodeResponse.locationPoint.zCoordinate.value)

    this.addObject(mesh);
}