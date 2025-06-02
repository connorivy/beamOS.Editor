import * as THREE from "three";
import { Raycaster } from "./Raycaster";

export interface IBeamOsMesh<
    TGeometry extends THREE.BufferGeometry = THREE.BufferGeometry,
    TMaterial extends THREE.Material = THREE.Material
> {
    id: number;
    beamOsId: number;
    beamOsUniqueId: string;
    beamOsObjectType: string;
    geometry: TGeometry;
    material: TMaterial;
    SetColorFilter(color: number, ghost: boolean): void;
    RemoveColorFilter(): void;
    GetPosition(): THREE.Vector3;
}

export abstract class BeamOsMesh<
    TGeometry extends THREE.BufferGeometry = THREE.BufferGeometry,
    TMaterial extends THREE.Material = THREE.Material,
    TEventMap extends THREE.Object3DEventMap = THREE.Object3DEventMap
>
    extends THREE.Mesh<TGeometry, TMaterial, TEventMap>
    implements IBeamOsMesh {
    private previousMaterial: TMaterial | undefined;
    public beamOsUniqueId: string;

    constructor(
        public beamOsId: number,
        public beamOsObjectType: string,
        geometry?: TGeometry,
        material?: TMaterial
    ) {
        super(geometry, material);
        this.beamOsUniqueId = this.beamOsObjectType + beamOsId;
    }

    public GetPosition(): THREE.Vector3 {
        return this.position.clone();
    }

    public SetColorFilter(color: number, ghost: boolean) {
        this.previousMaterial = this.material;
        const copy = Raycaster.GetMaterialCloneWithProvidedColor(
            this.material,
            color
        );
        if (ghost) {
            copy.transparent = true;
            copy.opacity = 0.2;
        }
        this.material = copy;
    }

    public RemoveColorFilter() {
        if (this.previousMaterial == undefined) {
            throw new Error(
                "Trying to unghost, but previous material is undefined"
            );
        }
        this.material = this.previousMaterial;
        this.previousMaterial = undefined;
    }
}
