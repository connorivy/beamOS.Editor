import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";

export class EditorConfigurations {
    public defaultElement1dMaterial: LineMaterial;
    public removeNodeProposalHex: number = 0xF44336; // strong red
    public createNodeProposalHex: number = 0x4CAF50; // medium green
    public modifyNodeProposalHexNew: number = 0xFFEB3B; // bright yellow
    public modifyNodeProposalHexExisting: number = 0xFFC107; // amber
    public removeElement1dProposalHex: number = 0xD32F2F; // darker red
    public createElement1dProposalHex: number = 0x388E3C; // darker green
    public modifyElement1dProposalHexNew: number = 0xFFF176; // lighter yellow
    public modifyElement1dProposalHexExisting: number = 0xFFD54F; // light amber
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
