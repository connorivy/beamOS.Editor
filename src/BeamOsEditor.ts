import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { NodeResponse } from './PhysicalModel.Contracts/NodeResponse'

export class IntersectedMeshProperties {
    constructor(public id: number, public colorHex : number ) {

    }
}

export class BeamOsEditor {
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    raycaster: THREE.Raycaster
    mouse: THREE.Vector2
    onDownPosition: THREE.Vector2 = new THREE.Vector2(0, 0)
    onUpPosition: THREE.Vector2 = new THREE.Vector2(0, 0)
    intersected?: IntersectedMeshProperties
    tabIndex: number = 0


    constructor(public domElement: HTMLElement)
    {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 1000 );
        this.renderer = new THREE.WebGLRenderer({ canvas: domElement, antialias: true });
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2(-1000, -1000);
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

        const controls = new OrbitControls( this.camera, this.renderer.domElement );
        
        //controls.update() must be called after any manual changes to the camera's transform
        this.camera.position.set( 5, 5, 10 );
        controls.update();

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

        window.addEventListener( 'pointermove', this.onPointerMove.bind(this) );


        // this.camera.position.z = 5;
        // const transformControls = new TransformControls( this.camera, this.domElement );

        // const controls = new EditorControls(this.camera, this.domElement)
        // controls.enabled = true;
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

        this.raycast()
    }

    onPointerMove( event: MouseEvent ) {

        // calculate pointer position in normalized device coordinates
        // (-1 to +1) for both components

        // this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        // this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        var rect = this.renderer.domElement.getBoundingClientRect();

        this.mouse.x = ( ( event.clientX - rect.left ) / ( rect.width ) ) * 2 - 1;
        this.mouse.y = - ( ( event.clientY - rect.top ) / ( rect.height) ) * 2 + 1;

    }

    raycast() {
        this.raycaster.setFromCamera( this.mouse, this.camera );

        // calculate objects intersecting the picking ray
        const intersects = this.raycaster.intersectObjects( this.scene.children )
            .filter(o => !(o.object instanceof THREE.GridHelper))
            .map(o => o.object as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>)

        if ( intersects.length > 0 ) {
            this.tabIndex = intersects.length >= this.tabIndex 
            ? 0
            : this.tabIndex;
            const intersectedObj = intersects[this.tabIndex];

            if (this.intersected && this.intersected.id == intersectedObj.id) {
                return;
            }

            this.intersected = new IntersectedMeshProperties(
                intersectedObj.id, 
                intersectedObj.material.emissive.getHex())
            
            intersectedObj.material.emissive.setHex(0xff0000);
        }
        else {

            if ( this.intersected ) {
                const sceneObj = this.scene.getObjectById(this.intersected.id) as THREE.Mesh
                (sceneObj.material as THREE.MeshStandardMaterial).emissive.setHex(this.intersected.colorHex)
            }

            this.intersected = undefined;
        }
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

    getIntersects( point: THREE.Vector2 ) {

		this.mouse.set( ( point.x * 2 ) - 1, - ( point.y * 2 ) + 1 );

		this.raycaster.setFromCamera( this.mouse, this.camera );

		const objects:THREE.Object3D[] = [];

		this.scene.traverseVisible( function ( child ) {

			objects.push( child );

		} );

		// sceneHelpers.traverseVisible( function ( child ) {

		// 	if ( child.name === 'picker' ) objects.push( child );

		// } );

		return this.raycaster.intersectObjects( objects, false );

	}
}