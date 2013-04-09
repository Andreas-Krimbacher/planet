PS.lib.Universe = Class.extend({
	// ==== variables ====
	
	CLASS_NAME: "PS.Universe",

    renderer : null,
    scene : null,
    camera : null,
    container : null,
    trackballControls : null,

    planets : null,
    cameraIsOnPlanet : null,

    stars : null,


    // ==== functions ====
	init : function(containerDiv){

        this.planets = [];

        this.container = $('#'+containerDiv);

        this._initCamera();

        this.scene = new THREE.Scene();
        this.scene.add(this.camera);

        this.renderer = new THREE.WebGLRenderer({ antialias: false } );
        this.renderer.setSize(this.container.width(), this.container.height());
        this.container.append(this.renderer.domElement);

	},

    _initCamera : function(){
        this.camera = new THREE.PerspectiveCamera( 45,  this.container.width() /  this.container.height(), 1, 100000 );
        this.camera.position.x = -600;
        this.camera.position.y = 600;
        this.camera.position.z = 600;
        this.trackballControls = new THREE.TrackballControls( this.camera );
        this.trackballControls.rotateSpeed = 1.0;
        this.trackballControls.zoomSpeed = 1.2;
        this.trackballControls.panSpeed = 0.8;

        this.trackballControls.noZoom = false;
        this.trackballControls.noPan = false;

        this.trackballControls.staticMoving = true;
        this.trackballControls.dynamicDampingFactor = 0.3;

        this.trackballControls.keys = [ 65, 83, 68 ];

        this.trackballControls.addEventListener( 'change', this.renderScene.bind(this) );
    },

    resetCamera : function(){
        if(this.cameraIsOnPlanet){
            this.cameraIsOnPlanet.removeCamera();
            this.cameraIsOnPlanet = null;
        }

        this.destroyCamera();

        this._initCamera();
        this.scene.add(this.camera);
    },

    setCameraToPlanet : function(planet){
        if(this.planets[planet]){
            if(this.cameraIsOnPlanet){
                this.cameraIsOnPlanet.removeCamera();
                this.cameraIsOnPlanet = null;
            }

            this.destroyCamera();

            this._initCamera();
            this.scene.add(this.camera);

            this.planets[planet].setCamera(this.camera);
            this.cameraIsOnPlanet = this.planets[planet];
        }
        else{
            return 0;
        }
    },

    destroyCamera : function(){
        this.scene.remove(this.camera);
        this.camera = null;
    },

    run : function(){

        requestAnimationFrame( this.run.bind(this) );
        this.renderScene();
        this.trackballControls.update();
        for(var x in this.planets){
            this.planets[x].update();
        }

    },

	renderScene : function(){

        // Render the scene
        this.renderer.render( this.scene, this.camera );



    },

    addObject : function(object){

        this.scene.add(object);

    },

    addPlanet : function(planet){

        this.planets[planet.planetDataObject.Name] = (planet);
        this.scene.add(planet.getObjectGroup());
        this.scene.add(planet.getOrbit());

    },

    addStars : function(stars){
        this.stars = stars;
        this.scene.add(stars);
    },

    addLight : function(){

        // create a point light
        var pointLight = new THREE.PointLight( 0xffffff, 1.2 );

        // set its position
        pointLight.position.x = 0;
        pointLight.position.y = 0;
        pointLight.position.z = 0;

        // add to the scene
        this.scene.add(pointLight);

        var amb = new THREE.AmbientLight(0x676767);
        this.scene.add(amb);

    },

    showAxis : function(type){
        // Create an empty geometry object to hold the line vertex data
        var geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(0, 0, 0));
        if(type == 'x') geometry.vertices.push(new THREE.Vector3(15000, 0, 0));
        if(type == 'y') geometry.vertices.push(new THREE.Vector3(0, 15000, 0));
        if(type == 'z') geometry.vertices.push(new THREE.Vector3(0, 0, 15000));

        if(type == '-x') geometry.vertices.push(new THREE.Vector3(-15000, 0, 0));
        if(type == '-y') geometry.vertices.push(new THREE.Vector3(0, -15000, 0));
        if(type == '-z') geometry.vertices.push(new THREE.Vector3(0, 0, -15000));

        material = new THREE.LineBasicMaterial( { color: 0xffccff, opacity: .5, linewidth: 2 } );

        // Create the line
        this.scene.add(new THREE.Line( geometry, material ));

    }
	
  
});