import * as THREE from 'three'

export class BeamOsMesh<
    TGeometry extends THREE.BufferGeometry = THREE.BufferGeometry,
    TMaterial extends THREE.Material | THREE.Material[] = THREE.Material | THREE.Material[],
    TEventMap extends THREE.Object3DEventMap = THREE.Object3DEventMap,
> extends THREE.Mesh<TGeometry, TMaterial, TEventMap> {
    constructor(public beamOsId: string, geometry?: TGeometry, material?: TMaterial) {
        super(geometry, material);
    }
}