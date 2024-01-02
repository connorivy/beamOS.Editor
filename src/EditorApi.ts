import * as THREE from 'three'
import { BeamOsMesh } from './BeamOsMesh';
import { Element1DResponse, IEditorApiAlpha, ModelResponseHydrated, NodeResponse } from './EditorApi/EditorApiAlpha';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { EditorConfigurations } from './EditorConfigurations';

export class EditorApi implements IEditorApiAlpha {

    constructor(private scene: THREE.Scene, private config: EditorConfigurations) {

    }

    async createElement1d(element1DResponse: Element1DResponse): Promise<string> {
        console.log("createElement1d", element1DResponse);
        let startNode = this.scene.getObjectByProperty("beamOsId", element1DResponse.startNodeId) as BeamOsMesh;
        let endNode = this.scene.getObjectByProperty("beamOsId", element1DResponse.endNodeId) as BeamOsMesh;
        
        const lineGeometry = new LineGeometry();
	    lineGeometry.setPositions( [
            startNode.position.x, 
            startNode.position.y, 
            startNode.position.z, 
            endNode.position.x, 
            endNode.position.y, 
            endNode.position.z
        ] );

        let line = new Line2( lineGeometry, this.config.defaultElement1dMaterial );
        line.computeLineDistances();
        line.scale.set( 1, 1, 1 );
        this.scene.add( line );
        
        return startNode.beamOsId;
    }

    async createModelHydrated(modelResponseHydrated: ModelResponseHydrated): Promise<string> {
        console.log("createModelHydrated", modelResponseHydrated);
        modelResponseHydrated.nodes.forEach(async node => {
            await this.createNode(node);
        });
        modelResponseHydrated.element1Ds.forEach(async element1d => {
            await this.createElement1d(element1d)
        });
        return "";
    }
    
    async createNode(nodeResponse: NodeResponse): Promise<string> {
        console.log("createNode", nodeResponse);
        const geometry = new THREE.SphereGeometry(.1);
        const mesh = new BeamOsMesh(nodeResponse.id, geometry, new THREE.MeshStandardMaterial());
        mesh.position.set(
            nodeResponse.locationPoint.xCoordinate.value, 
            nodeResponse.locationPoint.yCoordinate.value, 
            nodeResponse.locationPoint.zCoordinate.value)

        this.addObject(mesh);
        return "";
    }

    addObject(mesh: THREE.Mesh) {
        this.scene.add(mesh);
    }
}