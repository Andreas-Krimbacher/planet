//Autor: Andreas Krimbacher

// This object creates a planet, the moons of the planet and the orbits
// provides the animation, set camera to planet and set date function for the planet and the moons

PS.lib.Planet = Class.extend({
// ==== variables ====
    CLASS_NAME: "PS.Planet",

    //Path to image directory , with respect to index.html
    IMAGE_PATH : 'img/',

    //planet parameter object
    planetDataObject : null,

    //parameters for creating planet and moon mesh and orbits
    segments : 32,
    segmentsOrbit : 120,
    rings : 32,

    //!! the following hierarchy numbers like the chapters in a book
    //!! 1 and 2 are at the same level
    //!! 1.1 is inside of 1
    //!! the rotation information is for the initial position
    //!! during animation and set date additional rotations are applied
    //!! reference for the ascending node is the x axis
    //!! inclination is applied against the horizontal plane

    //top container, contains all expect of the planet orbit
    //hierarchy 1
    //center is offset by eccentricity in direction of perihelion
    //rotation: longitude of the ascending node, inclination, argument of perihelion, true anomaly
    objectGroup : null,

    //container for the planet orbit
    //hierarchy 2
    //center is offset by eccentricity in direction of perihelion
    //rotation: longitude of the ascending node, inclination, argument of perihelion, true anomaly
    orbit : null,

    //container for the planet and its moons + orbits
    //hierarchy 1.1
    //center: objectGroup + semi-major axis
    objectGroupPlanet : null,

    //tilted container for the planet and its moons + orbits
    //hierarchy 1.1.1
    //center: objectGroupPlanet
    //rotation: obliquity to orbit, rotation axis is z
    objectGroupPlanetTilt : null,

    //planet mesh object
    //hierarchy 1.1.1.1
    //center: objectGroupPlanet
    planetMesh : null,

    //rotation axis line object
    //hierarchy 1.1.1.2
    //center: objectGroupPlanet
    rotAxisLine : null,

    //object with a container for each moon mesh
    //hierarchy 1.1.1.3 if toEcliptic is false
    //hierarchy 1.1.2 if toEcliptic is true
    //center: objectGroupPlanet or objectGroupPlanetTilt + eccentricity in direction of perihelion
    //rotation: longitude of the ascending node, inclination, argument of perihelion, true anomaly
    objectGroupMoon : null,

    //object with a container for each moon orbit
    //hierarchy 1.1.1.2 if toEcliptic is false
    //hierarchy 1.1.2 if toEcliptic is true
    //center: objectGroupPlanet or objectGroupPlanetTilt + eccentricity in direction of perihelion
    //rotation: longitude of the ascending node, inclination, argument of perihelion, true anomaly
    orbitMoon : null,

    //rotation axis for the planets period rotation, perpendicular to the orbit
    rotAxis : null,
    //object with rotation axis for all moons, perpendicular to the moon orbits
    rotAxisMoon : null,


    //forward and backward quaternion
    //for moons as a object which has as values a quaternion for each moon
    //for all 3 speed level
    quaternionForwardSpeed1 : null,
    quaternionBackwardSpeed1 : null,
    quaternionMoonForwardSpeed1 : null,
    quaternionMoonBackwardSpeed1 : null,
    quaternionForwardSpeed2 : null,
    quaternionBackwardSpeed2 : null,
    quaternionMoonForwardSpeed2 : null,
    quaternionMoonBackwardSpeed2 : null,
    quaternionForwardSpeed3 : null,
    quaternionBackwardSpeed3 : null,
    quaternionMoonForwardSpeed3 : null,
    quaternionMoonBackwardSpeed3 : null,

    //camera object if camera is added to the planet
    camera : null,

    //days of movement per animation cycle and speed
    //!!! must be the same as in the Universe class!!!
    daysSpeed1:0.005,
    daysSpeed2:1,
    daysSpeed3:100,

    actualDay: 0,

    //intialize
    init : function(planetDataObject){
        this.planetDataObject = planetDataObject;
        this._createPlanet();
    },

    //create the planet,moons and orbits
    _createPlanet : function(){

//        reset planet parameters for production
//        this.planetDataObject.node = 90;
//        this.planetDataObject.i = 0;
//        this.planetDataObject.omega = 0;
//        this.planetDataObject.MJ2000_True = 0;
//        this.planetDataObject.e = 0;
//        this.planetDataObject.AxialTilt = 0;

        var planetDataObject = this.planetDataObject;

        //create containers
        this.objectGroup = new THREE.Object3D();
        //enable quaternion for orbit
        this.objectGroup.useQuaternion  = true;

        this.objectGroupPlanet = new THREE.Object3D();
        //enable quaternion for orbit
        this.objectGroupPlanet.useQuaternion  = true;
        this.objectGroupPlanet.quaternion = new THREE.Quaternion();
        this.objectGroupPlanet.position.x = planetDataObject.a;
        this.objectGroup.add(this.objectGroupPlanet);

        this.objectGroupPlanetTilt = new THREE.Object3D();
        //(-1) because the Obliquity to orbit is from the axis which is perpendicular to the orbit
        //!! the tilt is applied in direction of the orbit, from north
        if(this.planetDataObject.AxialTilt) this.objectGroupPlanetTilt.rotation.x = (-1) * this.planetDataObject.AxialTilt * Math.PI/180;
        this.objectGroupPlanet.add(this.objectGroupPlanetTilt);

        //create the line for the rotation axis
        if(this.planetDataObject.Status != 'Sonne'){
            //rotations axis
            var geometry = new THREE.Geometry();
            geometry.vertices.push(new THREE.Vector3(0, -(planetDataObject.Durchm1/2)*1.2, 0));
            geometry.vertices.push(new THREE.Vector3(0, (planetDataObject.Durchm1/2)*1.2, 0));
            var material = new THREE.LineBasicMaterial({
                color: 0x677798
            });
            this.rotAxisLine = new THREE.Line( geometry, material );
            this.objectGroupPlanetTilt.add(this.rotAxisLine);
        }

        // create the moons and moon orbits ----------------------------------------------------------------------------
        if(planetDataObject.moon){
            //intialize objects
            this.objectGroupMoon = {};
            this.orbitMoon = {};
            this.quaternionMoonForwardSpeed1 = {};
            this.quaternionMoonBackwardSpeed1 = {};
            this.quaternionMoonForwardSpeed2 = {};
            this.quaternionMoonBackwardSpeed2 = {};
            this.quaternionMoonForwardSpeed3 = {};
            this.quaternionMoonBackwardSpeed3 = {};
            this.rotAxisMoon = {};

            // create each moon and moon orbit
            var meshMoon;
            for(var x in planetDataObject.moon){
                //create the moon orbit
                this.orbitMoon[planetDataObject.moon[x].Name] = this._createOrbit(parseFloat(planetDataObject.moon[x].a)+(planetDataObject.Durchm1/2));
                //enable quaternion for orbit
                this.orbitMoon[planetDataObject.moon[x].Name].useQuaternion  = true;

                //add the moon orbit to the objectGroupPlanet or objectGroupPlanetTilt depending on the toEcliptic parameter
                if(planetDataObject.moon[x].toEcliptic) this.objectGroupPlanet.add(this.orbitMoon[planetDataObject.moon[x].Name]);
                else this.objectGroupPlanetTilt.add(this.orbitMoon[planetDataObject.moon[x].Name]);

                //create the objectGroupMoon container
                this.objectGroupMoon[planetDataObject.moon[x].Name] = new THREE.Object3D();
                //enable quaternion for orbit
                this.objectGroupMoon[planetDataObject.moon[x].Name].useQuaternion  = true;

                // create the moon texture
                if(planetDataObject.moon[x].img){
                    var texture = THREE.ImageUtils.loadTexture(this.IMAGE_PATH + planetDataObject.moon[x].img);
                    var material = new THREE.MeshPhongMaterial( {map: texture, ambient: 0x333333} );
                }
                else{
                    var material = new THREE.MeshPhongMaterial( { color: 0x999999, ambient: 0x333333} );
                }

                //create the moon mesh
                meshMoon = new THREE.Mesh(
                    new THREE.SphereGeometry(planetDataObject.moon[x].Durchm1/2, this.segments, this.rings),
                    material);
                meshMoon.position.x = parseFloat(planetDataObject.moon[x].a)+(planetDataObject.Durchm1/2);

                //add the moon mesh to the objectGroupMoon container
                this.objectGroupMoon[planetDataObject.moon[x].Name].add(meshMoon);

                //add the objectGroupMoon to the objectGroupPlanet or objectGroupPlanetTilt depending on the toEcliptic parameter
                if(planetDataObject.moon[x].toEcliptic) this.objectGroupPlanet.add(this.objectGroupMoon[planetDataObject.moon[x].Name]);
                else this.objectGroupPlanetTilt.add(this.objectGroupMoon[planetDataObject.moon[x].Name]);
//                reset planet parameters for production
//                this.planetDataObject.moon[x].node = 45;
//                this.planetDataObject.moon[x].i = 45;
//                this.planetDataObject.moon[x].omega = 0;
//                this.planetDataObject.moon[x].MJ2000_True = 0;
//                this.planetDataObject.moon[x].e = 0.7;

                //apply the moon orbit parameters to the objectGroupMoon and the orbitMoon
                this._alignOrbit( this.objectGroupMoon[planetDataObject.moon[x].Name] , planetDataObject.moon[x],this.orbitMoon[planetDataObject.moon[x].Name],true);
            }
        }
        //--------------------------------------------------------------------------------------------------------------

        // create the planet mesh and the planet orbit -----------------------------------------------------------------
        // create the planet texture
        if(planetDataObject.img){
            var texture = THREE.ImageUtils.loadTexture(this.IMAGE_PATH + planetDataObject.img);

            if(this.planetDataObject.Status == 'Sonne'){
                var material = new THREE.MeshLambertMaterial( { map: texture } );
            }
            else{
                // for the planets we need the MeshPhongMaterial to reflect the point light of the sun
                var material = new THREE.MeshPhongMaterial( {map: texture, ambient: 0x333333} );
            }
        }
        else{
            var material = new THREE.MeshPhongMaterial( { color: 0x999999, ambient: 0x333333} );
        }
        //create the planet mesh
        this.planetMesh = new THREE.Mesh(
            new THREE.SphereGeometry((planetDataObject.Durchm1/2), this.segments, this.rings),
            material);
        //add the planet mesh to the objectGroupPlanetTilt container
        this.objectGroupPlanetTilt.add(this.planetMesh);

        //create the planet orbit
        if(this.planetDataObject.Status != 'Sonne'){
            this.orbit = this._createOrbit((planetDataObject.a));
            //enable quaternion for orbit
            this.orbit.useQuaternion  = true;
        }

        //apply the planet orbit parameters to the objectGroup and the orbit
        if(this.planetDataObject.Status != 'Sonne') this._alignOrbit( this.objectGroup ,this.planetDataObject, this.orbit, false);
        //--------------------------------------------------------------------------------------------------------------
    },
    //create a orbit, conatiner plus line geometry
    //Parameter: Semi-major axis
    _createOrbit : function(a){
        var geometry = new THREE.Geometry();
        var i, twopi = 2 * Math.PI;

        for (i = 0; i <= this.segmentsOrbit; i++)
        {
            var x = a * Math.cos( i / this.segmentsOrbit * twopi );
            var z = a * Math.sin( i / this.segmentsOrbit * twopi );
            var vertex = new THREE.Vector3(x, 0, z);
            geometry.vertices.push(vertex);
        }

        var material = new THREE.LineBasicMaterial({
            color: 0x677798
        });

        var orbit = new THREE.Object3D();
        orbit.add(new THREE.Line( geometry, material ));
        return orbit
    },
    // apply the orbit parameters to a objectGroup and an orbit
    // Parameters: object: objectGroup or objectgroupMoon
    //              options: orbit paramters, planet or moon parameter object
    //              orbit: orbit object (planet or moon)
    //              isMoon: true if it is a moon
    _alignOrbit : function(object,options,orbit,isMoon){
        var quaternion = new THREE.Quaternion();
        var axis,axis_x,axis_y,axis_z;

        // Longitude of the ascending node, rotation axis: y
        object.quaternion = new THREE.Quaternion();
        object.quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), options.node*Math.PI/180);
        object.quaternion.normalize();

        if(!isMoon){
            //rotate the object to keep the heading with the x axis
            quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), (-1) * (parseFloat(options.node))*Math.PI/180);
            this.objectGroupPlanet.quaternion.multiply(quaternion);
            this.objectGroupPlanet.quaternion.normalize();
        }

        // Inclination, rotation axis: center to ascending node
        // dont move the object, because the object is at the ascending node

        // Inclination orbit, rotation axis: center to ascending node
        if(orbit){
            axis_x = Math.cos(options.node*Math.PI/180);
            axis_y = 0;
            axis_z = Math.sin(-options.node*Math.PI/180);
            axis = new THREE.Vector3(axis_x,axis_y,axis_z);

            orbit.quaternion = new THREE.Quaternion();
            orbit.quaternion.setFromAxisAngle(axis.normalize(), options.i*Math.PI/180);
            object.quaternion.normalize();
        }

        // Argument of perihelion, rotation axis: perpendicular to the orbit
        axis_y = Math.cos(options.i*Math.PI/180);
        axis_x = Math.sin(options.i*Math.PI/180) * Math.sin(-options.node*Math.PI/180);
        axis_z = Math.sin(options.i*Math.PI/180) * Math.cos(options.node*Math.PI/180);
        var rotAxis = new THREE.Vector3(axis_x,axis_y,axis_z);

        rotAxis.applyQuaternion(object.quaternion);
        quaternion.setFromAxisAngle(rotAxis.normalize(), (parseFloat(options.omega))*Math.PI/180);
        object.quaternion.multiply(quaternion);
        object.quaternion.normalize();

        // Eccentricity ------------------------------------------------------------------------------------------------
        // !!We need to update the world matrix of the object to apply all previous rotations
        // !!otherwise we get a wrong position for the perihelion
        object.updateMatrixWorld();
        // Get the Vector from the center to the perihelion
        var perihel = new THREE.Vector3();
        perihel.getPositionFromMatrix(object.children[0].matrixWorld);

        // Set the amount of the shift
        perihel.setLength((options.a*options.e));

        // Apply eccentricity
        object.position.add(perihel.clone().negate());
        if(orbit) orbit.position.add(perihel.clone().negate());
        //--------------------------------------------------------------------------------------------------------------

        // True anomaly, rotation axis: perpendicular to the orbit
        quaternion.setFromAxisAngle(rotAxis, (parseFloat(options.MJ2000_True))*Math.PI/180);
        object.quaternion.multiply(quaternion);
        object.quaternion.normalize();

        if(!isMoon){
            //rotate the object to keep the heading with the x axis
            quaternion.setFromAxisAngle(rotAxis, (-1) * (parseFloat(options.MJ2000_True)+parseFloat(options.omega))*Math.PI/180);
            this.objectGroupPlanet.quaternion.multiply(quaternion);
            this.objectGroupPlanet.quaternion.normalize();
        }

        // Create the rotation matrix for the animation function
        var quaternionForwardSpeed1 = new THREE.Quaternion();
        var quaternionBackwardSpeed1 = new THREE.Quaternion();
        var quaternionForwardSpeed2 = new THREE.Quaternion();
        var quaternionBackwardSpeed2 = new THREE.Quaternion();
        var quaternionForwardSpeed3 = new THREE.Quaternion();
        var quaternionBackwardSpeed3 = new THREE.Quaternion();
        if(isMoon){
            // for a monn
            quaternionForwardSpeed1.setFromAxisAngle(rotAxis, (2*Math.PI) / options.Periode * (this.daysSpeed1));
            quaternionBackwardSpeed1.setFromAxisAngle(rotAxis, - (2*Math.PI) / options.Periode * (this.daysSpeed1));
            this.quaternionMoonForwardSpeed1[options.Name] = quaternionForwardSpeed1;
            this.quaternionMoonBackwardSpeed1[options.Name] = quaternionBackwardSpeed1;
            quaternionForwardSpeed2.setFromAxisAngle(rotAxis, (2*Math.PI) / options.Periode * (this.daysSpeed2));
            quaternionBackwardSpeed2.setFromAxisAngle(rotAxis, - (2*Math.PI) / options.Periode * (this.daysSpeed2));
            this.quaternionMoonForwardSpeed2[options.Name] = quaternionForwardSpeed2;
            this.quaternionMoonBackwardSpeed2[options.Name] = quaternionBackwardSpeed2;
            quaternionForwardSpeed3.setFromAxisAngle(rotAxis, (2*Math.PI) / options.Periode * (this.daysSpeed3));
            quaternionBackwardSpeed3.setFromAxisAngle(rotAxis, - (2*Math.PI) / options.Periode * (this.daysSpeed3));
            this.quaternionMoonForwardSpeed3[options.Name] = quaternionForwardSpeed3;
            this.quaternionMoonBackwardSpeed3[options.Name] = quaternionBackwardSpeed3;
            // save the rotation axis (perpendicular to the orbit)
            this.rotAxisMoon[options.Name] = rotAxis;
        }
        else{
            // for a planet
            quaternionForwardSpeed1.setFromAxisAngle(rotAxis, (2*Math.PI) * (this.daysSpeed1) / options.Periode);
            quaternionBackwardSpeed1.setFromAxisAngle(rotAxis, - (2*Math.PI) * (this.daysSpeed1) / options.Periode);
            this.quaternionForwardSpeed1 = quaternionForwardSpeed1;
            this.quaternionBackwardSpeed1 = quaternionBackwardSpeed1;
            quaternionForwardSpeed2.setFromAxisAngle(rotAxis, (2*Math.PI) * (this.daysSpeed2) / options.Periode);
            quaternionBackwardSpeed2.setFromAxisAngle(rotAxis, - (2*Math.PI) * (this.daysSpeed2) / options.Periode);
            this.quaternionForwardSpeed2 = quaternionForwardSpeed2;
            this.quaternionBackwardSpeed2 = quaternionBackwardSpeed2;
            quaternionForwardSpeed3.setFromAxisAngle(rotAxis, (2*Math.PI) * (this.daysSpeed3)  / options.Periode);
            quaternionBackwardSpeed3.setFromAxisAngle(rotAxis, - (2*Math.PI) * (this.daysSpeed3) / options.Periode);
            this.quaternionForwardSpeed3 = quaternionForwardSpeed3;
            this.quaternionBackwardSpeed3 = quaternionBackwardSpeed3;
            // save the rotation axis (perpendicular to the orbit)
            this.rotAxis = rotAxis;
        }
    },
    //rotate the planet and the moons forward
    //Parameters: speed: 1,2,3
    //              animateMoons: true/false
    //              animateRotation: true/false (rotation of the planet around the planet rotation axis)
    updateForward : function(speed,animateMoons,animateRotation){
        if(this.quaternionForwardSpeed1){

            //planet rotation on orbit
            if(speed == 2) this.objectGroup.quaternion.multiply(this.quaternionForwardSpeed2);
            else if(speed == 3) this.objectGroup.quaternion.multiply(this.quaternionForwardSpeed3);
            else this.objectGroup.quaternion.multiply(this.quaternionForwardSpeed1);
            this.objectGroup.quaternion.normalize();

            //rotate the objectGroupPlanet to keep the heading with the x axis
            if(speed == 2) this.objectGroupPlanet.quaternion.multiply(this.quaternionBackwardSpeed2);
            else if(speed == 3) this.objectGroupPlanet.quaternion.multiply(this.quaternionBackwardSpeed3);
            else this.objectGroupPlanet.quaternion.multiply(this.quaternionBackwardSpeed1);
            this.objectGroupPlanet.quaternion.normalize();

            if(animateRotation && this.planetDataObject.Rotation){
                //rotate the planet around the planets rotation axis,
                if(speed == 2) this.planetMesh.rotation.y += 2 * Math.PI * this.daysSpeed2 / this.planetDataObject.Rotation;
                else if(speed == 3) this.planetMesh.rotation.y += 2 * Math.PI * this.daysSpeed3 / this.planetDataObject.Rotation;
                else this.planetMesh.rotation.y += 2 * Math.PI * this.daysSpeed1 / this.planetDataObject.Rotation;
            }
        }

        if(animateMoons && this.quaternionMoonForwardSpeed1){
            for(var x in this.quaternionMoonForwardSpeed1){
                    //moon rotation on orbit
                    if(speed == 2) this.objectGroupMoon[x].quaternion.multiply(this.quaternionMoonForwardSpeed2[x]);
                    else if(speed == 3) this.objectGroupMoon[x].quaternion.multiply(this.quaternionMoonForwardSpeed3[x]);
                    else this.objectGroupMoon[x].quaternion.multiply(this.quaternionMoonForwardSpeed1[x]);
                    this.objectGroupMoon[x].quaternion.normalize();
            }
        }
    },
    //rotate the planet and the moons backward
    //Parameters: speed: 1,2,3
    //              animateMoons: true/false
    //              animateRotation: true/false (rotation of the planet around the planet rotation axis)
    updateBackward : function(speed,animateMoons,animateRotation){
        if(this.quaternionBackwardSpeed1){

            //planet rotation on orbit
            if(speed == 2) this.objectGroup.quaternion.multiply(this.quaternionBackwardSpeed2);
            else if(speed == 3) this.objectGroup.quaternion.multiply(this.quaternionBackwardSpeed3);
            else this.objectGroup.quaternion.multiply(this.quaternionBackwardSpeed1);
            this.objectGroup.quaternion.normalize();

            //rotate the objectGroupPlanet to keep the heading with the x axis
            if(speed == 2) this.objectGroupPlanet.quaternion.multiply(this.quaternionForwardSpeed2);
            else if(speed == 3) this.objectGroupPlanet.quaternion.multiply(this.quaternionForwardSpeed3);
            else this.objectGroupPlanet.quaternion.multiply(this.quaternionForwardSpeed1);
            this.objectGroupPlanet.quaternion.normalize();

            if(animateRotation && this.planetDataObject.Rotation){
                //rotate the planet around the planets rotation axis,
                if(speed == 2) this.planetMesh.rotation.y += 2 * Math.PI * this.daysSpeed2 / this.planetDataObject.Rotation;
                else if(speed == 3) this.planetMesh.rotation.y += 2 * Math.PI * this.daysSpeed3 / this.planetDataObject.Rotation;
                else this.planetMesh.rotation.y += 2 * Math.PI * this.daysSpeed1 / this.planetDataObject.Rotation;
            }
        }

        if(animateMoons && this.quaternionMoonBackwardSpeed1){
            for(var x in this.quaternionMoonBackwardSpeed1){
                //moon rotation on orbit
                if(speed == 2) this.objectGroupMoon[x].quaternion.multiply(this.quaternionMoonBackwardSpeed2[x]);
                else if(speed == 3) this.objectGroupMoon[x].quaternion.multiply(this.quaternionMoonBackwardSpeed3[x]);
                else this.objectGroupMoon[x].quaternion.multiply(this.quaternionMoonBackwardSpeed1[x]);
                this.objectGroupMoon[x].quaternion.normalize();
            }
        }
    },
    //add the camera to the objectGroupPlanet
    setCamera : function(camera){
        this.objectGroupPlanet.add(camera.camera);

        var vectorToCenter = new THREE.Vector3().getPositionFromMatrix(this.planetMesh.matrixWorld);
        vectorToCenter.setLength(vectorToCenter.length()+((this.planetDataObject.Durchm1*3)));
        vectorToCenter.y += (parseFloat(this.planetDataObject.Durchm1));

        camera.camera.position = this.objectGroupPlanet.worldToLocal(vectorToCenter);

        this.camera = camera;
    },
    // remove the camera from the objectGroupPlanet
    removeCamera : function(){
        this.camera = null;
    },
    // move the planet and moons
    // Parameter: amount off days, can be a float and postive or negative
    moveDays : function(days){
        var quaternion = new THREE.Quaternion();

        //planet rotation on orbit
        quaternion.setFromAxisAngle(this.rotAxis, (days*2*Math.PI) / this.planetDataObject.Periode);
        this.objectGroup.quaternion.multiply(quaternion);
        this.objectGroup.quaternion.normalize();

        //rotate the objectGroupPlanet to keep the heading with the x axis
        quaternion.setFromAxisAngle(this.rotAxis, (-1) * (days*2*Math.PI) / this.planetDataObject.Periode);
        this.objectGroupPlanet.quaternion.multiply(quaternion);
        this.objectGroupPlanet.quaternion.normalize();

        //moon rotations
        for(var x in this.rotAxisMoon){
            quaternion.setFromAxisAngle(this.rotAxisMoon[x], (days*2*Math.PI) / this.planetDataObject.Periode);
            this.objectGroupMoon[x].quaternion.multiply(quaternion);
            this.objectGroupMoon[x].quaternion.normalize();
        }
    }
});
