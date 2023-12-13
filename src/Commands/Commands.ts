import { addNodeCommand } from './AddNodeCommand'

export class Commands {
    declare public addNodeCommand: typeof addNodeCommand;

    constructor(public scene: THREE.Scene) {

    }

    addObject(mesh: THREE.Mesh) {
        this.scene.add(mesh);
    }
}

Commands.prototype.addNodeCommand = addNodeCommand
