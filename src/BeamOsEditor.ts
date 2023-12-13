import * as THREE from 'three';
import { NodeResponse } from './PhysicalModel.Contracts/NodeResponse'
import { Raycaster } from './Raycaster';
import { Controls } from './Controls';
import { TransformController } from './TransformController';

export class BeamOsEditor {
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    mouse: THREE.Vector2
    onDownPosition: THREE.Vector2 = new THREE.Vector2(0, 0)
    onUpPosition: THREE.Vector2 = new THREE.Vector2(0, 0)
    raycaster: Raycaster
    transformController: TransformController

    constructor(public domElement: HTMLElement)
    {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 1000 );
        this.camera.position.set( 5, 5, 10 );

        this.renderer = new THREE.WebGLRenderer({ canvas: domElement, antialias: true });
        this.mouse = new THREE.Vector2(-1000, -1000);
        this.raycaster = new Raycaster(this.renderer, this.scene, this.mouse, this.camera);
        const controls = new Controls(this.camera, this.domElement);
        this.transformController = new TransformController(this.camera, this.domElement, controls.controls)
        this.initCanvas();
        this.animate();
    }

    static createFromId(domElementId: string) : BeamOsEditor {
        const domElement = document.getElementById(domElementId);
        if (!domElement) {
            throw new Error(`Unable to find dom element with id ${domElementId}`);
        }
        return new this(domElement);
    }

    initCanvas() {
        this.scene.background = new THREE.Color(0x333333);
	    this.scene.matrixWorldAutoUpdate = true;

        window.addEventListener( 'resize', this.resizeCanvasToDisplaySize.bind(this) );
        window.dispatchEvent(new Event("resize"));
        // this.renderer.setSize( window.innerWidth, window.innerHeight );

        const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        const material = new THREE.MeshStandardMaterial( { color: 0x00ff00 } );
        const cube = new THREE.Mesh( geometry, material );
        this.scene.add( cube );

        this.transformController.transformControl.attach(cube);
        this.scene.add(this.transformController.transformControl)

        const grid = new THREE.Group();

        const grid1 = new THREE.GridHelper( 30, 30, 0x282828 );
        grid1.material.color.setHex( 0x282828 );
        grid1.material.vertexColors = false;
        grid.add( grid1 );

        const grid2 = new THREE.GridHelper( 30, 6, 0x888888  );
        grid2.material.color.setHex( 0x888888  );
        grid2.material.vertexColors = false;
        grid.add( grid2 );

        this.scene.add(grid)
    }

    resizeCanvasToDisplaySize( _event: Event ) {
        const canvas = this.renderer.domElement;
        // look up the size the canvas is being displayed
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;     

        // adjust displayBuffer size to match
        if (canvas.width != width || canvas.height != height) {
            console.log('resize')
            // you must pass false here or three.js sadly fights the browser
            this.renderer.setSize(width, height, false);
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();

            // set matLine resolution
            // lineMat.resolution.set( width, height );  
        }
    }

    public sayHello() {
        console.log("hello :)");
    }

    public addNode(nodeResponse: NodeResponse) {
        const geometry = new THREE.SphereGeometry(1);
		const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
        mesh.position.set(
            nodeResponse.locationPoint.xCoordinate.value, 
            nodeResponse.locationPoint.yCoordinate.value, 
            nodeResponse.locationPoint.zCoordinate.value)
		mesh.name = 'Box';

        this.addObject(mesh);
    }

    addObject(mesh: THREE.Mesh) {
        this.scene.add(mesh);
    }

    public animate() {
        requestAnimationFrame( this.animate.bind(this) );
        this.render()
    }

    render() {
        this.renderer.render( this.scene, this.camera );

        this.raycaster.raycast()
    }

    onMouseDown( event: MouseEvent ) {

		// event.preventDefault();

		if ( event.target !== this.renderer.domElement ) return;

		const array = BeamOsEditor.getMousePosition( this.domElement, event.clientX, event.clientY );
		this.onDownPosition.fromArray( array );

		document.addEventListener( 'mouseup', this.onMouseUp );

	}

	onMouseUp( event: MouseEvent ) {

		const array = BeamOsEditor.getMousePosition( this.domElement, event.clientX, event.clientY );
		this.onUpPosition.fromArray( array );

		this.handleClick();

		document.removeEventListener( 'mouseup', this.onMouseUp );

	}

    static getMousePosition( dom: HTMLElement, x: number, y: number ) {
		const rect = dom.getBoundingClientRect();
		return [ ( x - rect.left ) / rect.width, ( y - rect.top ) / rect.height ];
	}

    handleClick() {

		if ( this.onDownPosition.distanceTo( this.onUpPosition ) === 0 ) {

			// const intersects = this.getIntersects( this.onUpPosition );
			// signals.intersectionsDetected.dispatch( intersects );

			this.render();

		}

	}
}