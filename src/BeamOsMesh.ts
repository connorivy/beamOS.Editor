import * as THREE from "three";

export interface IBeamOsMesh<
    TGeometry extends THREE.BufferGeometry = THREE.BufferGeometry,
    TMaterial extends THREE.Material = THREE.Material
> {
    id: number;
    beamOsId: string;
    geometry: TGeometry;
    material: TMaterial;
}

export class BeamOsMesh<
        TGeometry extends THREE.BufferGeometry = THREE.BufferGeometry,
        TMaterial extends THREE.Material = THREE.Material,
        TEventMap extends THREE.Object3DEventMap = THREE.Object3DEventMap
    >
    extends THREE.Mesh<TGeometry, TMaterial, TEventMap>
    implements IBeamOsMesh
{
    constructor(
        public beamOsId: string,
        geometry?: TGeometry,
        material?: TMaterial
    ) {
        super(geometry, material);
    }
}
