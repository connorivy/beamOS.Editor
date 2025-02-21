import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";

export class EditorConfigurations {
    public defaultElement1dMaterial: LineMaterial;
    public yAxisUp: boolean = false;
    public maxShearMagnitude: number = 0.0001;
    public maxMomentMagnitude: number = 0.0001;

    constructor(public isReadOnly: boolean) {
        this.defaultElement1dMaterial = new LineMaterial({
            color: 0x5f8575,
            linewidth: 0.1, // in world units with size attenuation, pixels otherwise
            worldUnits: true,
            vertexColors: false,

            //resolution:  // to be set by renderer, eventually
            alphaToCoverage: true,
        });
    }
}
