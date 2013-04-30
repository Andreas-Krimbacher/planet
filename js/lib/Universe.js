PS.lib.Universe = Class.extend({
	// ==== variables ====
	
	CLASS_NAME: "PS.Universe",

    renderer : null,
    scene : null,
    camera : null,
    container : null,
    trackballControls : null,

    planets : null,
    planetMove : false,
    sun : null,
    cameraIsOnPlanet : null,

    stars : null,

    date : new Date(2000,0,1),


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

        this.orbitControl = new THREE.OrbitControls( this.camera );
        this.orbitControl.addEventListener( 'change', this.renderScene.bind(this) );
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
        this.orbitControl.update();

        for(var x in this.planets){
            this.planets[x].updateCamera();
        }


        if(this.planetMove){
            for(var x in this.planets){
                this.planets[x].updateForward();
            }

            this.date.setDate(this.date.getDate() + 1);
            $('#year').html(this.date.toUTCString());
        }
    },
    startPlanetMove : function(){
        this.planetMove = true;
    },
    stopPlanetMove : function(){
        this.planetMove = false;
    },
    setDate : function(date){
        if(this.planetMove) this.stopPlanetMove();
        var diff = date - this.date;
        diffDays = Math.round(diff/(24*60*60*1000));

            for(var x in this.planets){
                this.planets[x].moveDays(diffDays);
            }

        this.date.setDate(this.date.getDate() + diffDays);
        $('#year').html(this.date.toUTCString());
    },
	renderScene : function(){

        // Render the scene
        this.renderer.render( this.scene, this.camera );



    },

    addObject : function(object){

        this.scene.add(object);

    },

    addPlanet : function(planet){

        if(planet.planetDataObject.Name != 'Sonne') this.planets[planet.planetDataObject.Name] = planet;
        else this.sun = planet;
        this.scene.add(planet.getObjectGroup());
        this.scene.add(planet.getOrbit());

        //this.scene.add(planet.perihelLine);


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

    },
    showPlane : function(){
        var geometry = new THREE.PlaneGeometry( 150000, 150000 );
        var material = new THREE.MeshBasicMaterial( { color: 0x0000ff, opacity: 0.2  } );
        material.transparent = true;
        material.side = THREE.DoubleSide;
        var mesh = new THREE.Mesh( geometry, material );
        mesh.rotation.x = Math.PI/2;
        this.scene.add( mesh );
    },
    hideOrbits : function(){
        for(var x in this.planets){
            this.planets[x].orbit.children[0].visible = false;
            for(var y in this.planets[x].orbitMoon){
                this.planets[x].orbitMoon[y].children[0].visible = false;
            }
        }
    },
    showOrbits : function(){
        for(var x in this.planets){
            this.planets[x].orbit.children[0].visible = true;
            for(var y in this.planets[x].orbitMoon){
                this.planets[x].orbitMoon[y].children[0].visible = true;
            }
        }
    },
    showPlanetOrbit : function(planet,moon){
        this.planets[planet].orbit.children[0].visible = true;
        if(moon){
            for(var x in this.planets[planet].orbitMoon){
                this.planets[planet].orbitMoon[x].children[0].visible = true;
            }
        }
    },
    hidePlanetOrbit : function(planet,moon){
        this.planets[planet].orbit.children[0].visible = false;
        if(moon){
            for(var x in this.planets[planet].orbitMoon){
                this.planets[planet].orbitMoon[x].children[0].visible = false;
            }
        }
    },
    showMoonOrbit : function(planet,moon){
        this.planets[planet].orbitMoon[moon].children[0].visible = true;
    },
    hideMoonOrbit : function(planet,moon){
        this.planets[planet].orbitMoon[moon].children[0].visible = false;
    }
  
});