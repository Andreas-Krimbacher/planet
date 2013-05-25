//Autor: Andreas Krimbacher

// This object creates a universe
// provides the animation, camera, visibility, and date capabilities

PS.lib.Universe = Class.extend({
    // ==== variables ====

    CLASS_NAME: "PS.Universe",

    //basic elements for the animation
    renderer : null,
    scene : null,
    camera : null,
    container : null,

    // camera controls
    orbitControl : null,
    panControl : null,

    //array of planet objects
    planets : null,
    sun : null,

    //if true the planets move
    planetMove : false,
    //direction of the planet move - forward,backward
    direction : 'forward',
    //planet move speed - -3,-2,-1,0,1,2,3 - from backward to forward, 0 is stop
    speed : 0,

    //days of movement per animation cycle and speed
    //!!! must be the same as in the Planet class!!!
    daysSpeed1:0.005,
    daysSpeed2:1,
    daysSpeed3:100,

    // if the camera is set to a planet the planet object is assigned
    cameraIsOnPlanet : null,

    stars : null,

    //current date of the univers
    date : new Date(2000,0,1),

    //true/false values for the visibility of dwarf planets,moons and orbits
    dwarfPlanetsVisible: true,
    moonVisible : true,
    orbitVisible : true,
    //true/false value for the animation of the planet rotation
    animateRotation : false,

    // initialization
    init : function(containerDiv){

        this.planets = [];
        this.container = $('#'+containerDiv);

        //create camera
        this._initCamera(-600000,600000,600000);

        //create scene
        this.scene = new THREE.Scene();
        this.scene.add(this.camera);

        //create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: false } );
        this.renderer.setSize(this.container.width(), this.container.height());

        //add renderer to dom
        this.container.append(this.renderer.domElement);
    },

    //initialize camera
    //Parameter: camera position
    _initCamera : function(x,y,z){
        this.camera = new THREE.PerspectiveCamera( 45,  this.container.width() /  this.container.height(), 1, 10000000000 );
        this.camera.position.x = x;
        this.camera.position.y = y;
        this.camera.position.z = z;

        //add orbit control
        this.orbitControl = new THREE.OrbitControls( this.camera , document.getElementById('webglOrbitControlCanvas'));
        this.orbitControl.maxDistance = 25000000;

        //add trackball control for right mouse button panning
        this.panControl = new THREE.TrackballControls( this.camera , document.getElementById('webglOrbitControlCanvas'));
        this.panControl.noRotate = true;
        this.panControl.noZoom = true;
        this.panControl.maxDistance = 25000000;
    },

    //recreate camera
    //Parameter: optional camera position
    resetCamera : function(x,y,z){
        if(this.cameraIsOnPlanet){
            this.cameraIsOnPlanet.removeCamera();
            this.cameraIsOnPlanet = null;
        }

        this.scene.remove(this.camera);
        this.camera = null;

        if(x) this._initCamera(x,y,z);
        else this._initCamera(-600000,600000,600000);

        this.scene.add(this.camera);
    },

    //helper function to get camera position
    alertCameraPosition : function(){
        alert('x,y,z:' + Math.round(this.camera.position.x) + ',' + Math.round(this.camera.position.y) + ',' + Math.round(this.camera.position.z));

    },

    //asign camera to a planet
    setCameraToPlanet : function(planet){
        if(this.planets[planet]){
            this.resetCamera();

            this.planets[planet].setCamera({camera: this.camera, orbitControl: this.orbitControl});
            this.cameraIsOnPlanet = this.planets[planet];
        }
        else{
            return 0;
        }
    },

    //animation cycle
    run : function(){
        //update camera controls
        this.orbitControl.update();
        this.panControl.update();

        // animate planets
        if(this.planetMove){
            if(this.direction == 'forward'){
                for(var x in this.planets){
                    this.planets[x].updateForward(this.speed,this.moonVisible,this.animateRotation);
                }

                //set universe date
                if(this.speed == 1) this.date.setTime(this.date.getTime() + this.daysSpeed1*1000*60*60*24);
                if(this.speed == 2) this.date.setTime(this.date.getTime() + this.daysSpeed2*1000*60*60*24);
                if(this.speed == 3) this.date.setTime(this.date.getTime() + this.daysSpeed3*1000*60*60*24);
            }
            if(this.direction == 'backward'){
                for(var x in this.planets){
                    this.planets[x].updateBackward(this.speed,this.moonVisible,this.animateRotation);
                }

                //set universe date
                if(this.speed == 1) this.date.setTime(this.date.getTime() - this.daysSpeed1*1000*60*60*24);
                if(this.speed == 2) this.date.setTime(this.date.getTime() - this.daysSpeed2*1000*60*60*24);
                if(this.speed == 3) this.date.setTime(this.date.getTime() - this.daysSpeed3*1000*60*60*24);
            }

            //update time slider
            PS.updateTimeSlider(this.date);
        }

        //render the scene
        this.renderer.render( this.scene, this.camera );
        //restart animation cycle
        requestAnimationFrame( this.run.bind(this) );
    },

    // stop planet move
    stopPlanetMove : function(){
        this.speed = 0;
        this.planetMove = false;
    },
    //set the animation to forward with defined speed
    forward : function(speed){
        this.direction = 'forward';
        this.speed = speed;
        if(!this.planetMove) this.planetMove = true;
    },
    //set the animation to backward with defined speed
    backward : function(speed){
        this.direction = 'backward';
        this.speed = speed;
        if(!this.planetMove) this.planetMove = true;
    },
    //start the rotation of the planets
    startPlanetRotation : function(){
        this.animateRotation = true;
    },
    //stop the rotation of the planets
    stopPlanetRotation : function(){
        this.animateRotation = false;
    },

    //set the universe date
    setDate : function(date,dontUpdateSlider){
        if(this.planetMove) this.stopPlanetMove();
        var diff = date - this.date;
        diffDays = Math.round(diff/(24*60*60*1000));

        for(var x in this.planets){
            this.planets[x].moveDays(diffDays);
        }

        this.date.setDate(this.date.getDate() + diffDays);
        if(!dontUpdateSlider) PS.updateTimeSlider(this.date);
    },

    //add object to the universe
    addObject : function(object){
        this.scene.add(object);
    },
    //add a planet to the universe
    addPlanet : function(planet){
        if(planet.planetDataObject.Name != 'Sonne') this.planets[planet.planetDataObject.Name] = planet;
        else this.sun = planet;

        this.scene.add(planet.orbit);
        this.scene.add(planet.objectGroup);
    },
    //add stars to the universe
    addStars : function(stars){
        this.stars = stars;
        this.scene.add(stars);
    },
    //add ambient and point light to the universe
    addLight : function(){

        // create a point light
        var pointLight = new THREE.PointLight( 0xffffff, 1.2 );

        // set its position
        pointLight.position.x = 0;
        pointLight.position.y = 0;
        pointLight.position.z = 0;

        // add to the scene
        this.scene.add(pointLight);


        var amb = new THREE.AmbientLight(0xFFFFFF);
        this.scene.add(amb);

    },

    //helper functions to show world axis
    showAxis : function(type){
        // Create an empty geometry object to hold the line vertex data
        var geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(0, 0, 0));
        if(type == 'x') geometry.vertices.push(new THREE.Vector3(1500000, 0, 0));
        if(type == 'y') geometry.vertices.push(new THREE.Vector3(0, 1500000, 0));
        if(type == 'z') geometry.vertices.push(new THREE.Vector3(0, 0, 1500000));

        if(type == '-x') geometry.vertices.push(new THREE.Vector3(-1500000, 0, 0));
        if(type == '-y') geometry.vertices.push(new THREE.Vector3(0, -1500000, 0));
        if(type == '-z') geometry.vertices.push(new THREE.Vector3(0, 0, -1500000));

        material = new THREE.LineBasicMaterial( { color: 0xffccff, opacity: .5, linewidth: 2 } );

        // Create the line
        this.scene.add(new THREE.Line( geometry, material ));

    },
    //helper functions to show the horizontal plane
    showPlane : function(){
        var geometry = new THREE.PlaneGeometry( 15000000, 15000000 );
        var material = new THREE.MeshBasicMaterial( { color: 0x00ff00, opacity: 0.1  } );
        material.transparent = true;
        material.side = THREE.DoubleSide;
        var mesh = new THREE.Mesh( geometry, material );
        mesh.rotation.x = Math.PI/2;
        this.scene.add( mesh );
    },

    //hide all orbits
    hideOrbits : function(){
        this.orbitVisible = false;
        for(var x in this.planets){
            this.planets[x].orbit.children[0].visible = false;
            for(var y in this.planets[x].orbitMoon){
                this.planets[x].orbitMoon[y].children[0].visible = false;
            }

        }
    },
    //hide all orbits without changing the orbitVisible flag
    clearOrbits : function(){
        for(var x in this.planets){
            this.planets[x].orbit.children[0].visible = false;
            for(var y in this.planets[x].orbitMoon){
                this.planets[x].orbitMoon[y].children[0].visible = false;
            }

        }
    },
    //show all orbits
    showOrbits : function(){
        this.orbitVisible = true;
        for(var x in this.planets){
            if(this.planets[x].planetDataObject.Status != 'Zwergplanet' || this.dwarfPlanetsVisible){
                this.planets[x].orbit.children[0].visible = true;
                if(this.moonVisible){
                    for(var y in this.planets[x].orbitMoon){
                        this.planets[x].orbitMoon[y].children[0].visible = true;
                    }
                }
            }
        }
    },
    //hide all dwarf planets
    hideDwarf : function(){
        this.dwarfPlanetsVisible = false;
        for(var x in this.planets){
            if(this.planets[x].planetDataObject.Status == 'Zwergplanet'){
                this.planets[x].planetMesh.visible = false;
                this.planets[x].rotAxisLine.visible = false;
                this.planets[x].orbit.children[0].visible = false;
                if(this.planets[x].objectGroupMoon){
                    for(var y in this.planets[x].orbitMoon){
                        this.planets[x].orbitMoon[y].children[0].visible = false;
                    }
                    for(var y in this.planets[x].objectGroupMoon){
                        this.planets[x].objectGroupMoon[y].children[0].visible = false;
                    }
                }
            }
        }
    },
    //show all dwarf planets
    showDwarf : function(){
        this.dwarfPlanetsVisible = true;
        for(var x in this.planets){
            if(this.planets[x].planetDataObject.Status == 'Zwergplanet'){
                this.planets[x].planetMesh.visible = true;
                this.planets[x].rotAxisLine.visible = true;
                this.planets[x].orbit.children[0].visible = true;
                if(this.planets[x].objectGroupMoon){
                    for(var y in this.planets[x].orbitMoon){
                        this.planets[x].orbitMoon[y].children[0].visible = true;
                    }
                    for(var y in this.planets[x].objectGroupMoon){
                        this.planets[x].objectGroupMoon[y].children[0].visible = true;
                    }
                }
            }
        }
    },
    //hide all moons
    hideMoons : function(){
        this.moonVisible = false;
        for(var x in this.planets){
            if(this.planets[x].objectGroupMoon){
                for(var y in this.planets[x].orbitMoon){
                    this.planets[x].orbitMoon[y].children[0].visible = false;
                }
                for(var y in this.planets[x].objectGroupMoon){
                    this.planets[x].objectGroupMoon[y].children[0].visible = false;
                }
            }
        }
    },
    //show all moons
    showMoons : function(){
        this.moonVisible = true;
        for(var x in this.planets){
            if(this.planets[x].objectGroupMoon){
                if(this.planets[x].planetDataObject.Status != 'Zwergplanet' || this.dwarfPlanetsVisible){
                    for(var y in this.planets[x].orbitMoon){
                        this.planets[x].orbitMoon[y].children[0].visible = true;
                    }
                    for(var y in this.planets[x].objectGroupMoon){
                        this.planets[x].objectGroupMoon[y].children[0].visible = true;
                    }
                }
            }
        }
    },

    //show the orbit of a planet and optional the orbit of a moon of this planet
    //Parameter: planet name
    //            optional moon name
    showPlanetOrbit : function(planet,moon){
        if(!this.orbitVisible) return;
        if(this.planets[planet].planetDataObject.Status != 'Zwergplanet' || this.dwarfPlanetsVisible){
            this.planets[planet].orbit.children[0].visible = true;
            if(moon && this.moonVisible){
                for(var x in this.planets[planet].orbitMoon){
                    this.planets[planet].orbitMoon[x].children[0].visible = true;
                }
            }
        }
    },
    //show only the orbit of a moon
    //Parameter: planet name
    //            optional moon name
    showMoonOrbit : function(planet,moon){
        if(!this.moonVisible || !this.orbitVisible) return;
        if(this.planets[planet].planetDataObject.Status != 'Zwergplanet' || this.dwarfPlanetsVisible){
            this.planets[planet].orbitMoon[moon].children[0].visible = true;
        }
    },

    //adjust the dwarf planets visibility
    //if the planet is a dwarf planet the visibility is set to true
    //Parameter: planet name
    adjustVisibility : function(planet){
        if(this.planets[planet].planetDataObject.Status == 'Zwergplanet'){
            if(PS.setLayerCheckbox) PS.setLayerCheckbox('dwarf',true);
            this.showDwarf();
        }
    },

    //move the camera
    //Parameter: direction - up,down,left,right,plus,minus
    moveCamera : function(direction){
        switch(direction){
            case "up":   this.orbitControl.rotateUp(0.05); break;
            case "down":   this.orbitControl.rotateDown(0.05); break;
            case "left":   this.orbitControl.rotateLeft(0.05); break;
            case "right":   this.orbitControl.rotateRight(0.05); break;
            case "plus":   this.orbitControl.zoomIn(2); break;
            case "minus":   this.orbitControl.zoomOut(2); break;
        }
    }
});
