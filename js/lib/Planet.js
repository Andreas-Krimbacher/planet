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


    //forward and backward rotation matrix
    //for moons as a object which has as values a matrix for each moon
    //for all 3 speed level
    rotWorldMatrixForwardSpeed1 : null,
    rotWorldMatrixBackwardSpeed1 : null,
    rotWorldMatrixMoonForwardSpeed1 : null,
    rotWorldMatrixMoonBackwardSpeed1 : null,
    rotWorldMatrixForwardSpeed2 : null,
    rotWorldMatrixBackwardSpeed2 : null,
    rotWorldMatrixMoonForwardSpeed2 : null,
    rotWorldMatrixMoonBackwardSpeed2 : null,
    rotWorldMatrixForwardSpeed3 : null,
    rotWorldMatrixBackwardSpeed3 : null,
    rotWorldMatrixMoonForwardSpeed3 : null,
    rotWorldMatrixMoonBackwardSpeed3 : null,

    //camera object if camera is added to the planet
    camera : null,

    //days of movement per animation cycle and speed
    //!!! must be the same as in the Universe class!!!
    daysSpeed1:0.005,
    daysSpeed2:0.5,
    daysSpeed3:100,

    //intialize
    init : function(planetDataObject){
        this.planetDataObject = planetDataObject;
        this._createPlanet();
    },

    //create the planet,moons and orbits
    _createPlanet : function(){

//        reset planet parameters for production
//        this.planetDataObject.node = 0;
//        this.planetDataObject.i = 0;
//        this.planetDataObject.omega = 0;
//        this.planetDataObject.MJ2000_True = 0;
//        this.planetDataObject.e = 0;
//        this.planetDataObject.AxialTilt = 40;

        var planetDataObject = this.planetDataObject;

        //create containers
        this.objectGroup = new THREE.Object3D();

        this.objectGroupPlanet = new THREE.Object3D();
        this.objectGroupPlanet.position.x = planetDataObject.a;
        this.objectGroup.add(this.objectGroupPlanet);

        this.objectGroupPlanetTilt = new THREE.Object3D();
        //(-1) because the Obliquity to orbit is from the axis which is perpendicular to the orbit
        if(this.planetDataObject.AxialTilt) this.objectGroupPlanetTilt.rotation.z = (-1) * this.planetDataObject.AxialTilt * Math.PI/180;
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
            this.rotWorldMatrixMoonForwardSpeed1 = {};
            this.rotWorldMatrixMoonBackwardSpeed1 = {};
            this.rotWorldMatrixMoonForwardSpeed2 = {};
            this.rotWorldMatrixMoonBackwardSpeed2 = {};
            this.rotWorldMatrixMoonForwardSpeed3 = {};
            this.rotWorldMatrixMoonBackwardSpeed3 = {};
            this.rotAxisMoon = {};

            // create each moon and moon orbit
            var meshMoon;
            for(var x in planetDataObject.moon){
                //create the moon orbit
                this.orbitMoon[planetDataObject.moon[x].Name] = this._createOrbit(parseFloat(planetDataObject.moon[x].a)+(planetDataObject.Durchm1/2));

                //add the moon orbit to the objectGroupPlanet or objectGroupPlanetTilt depending on the toEcliptic parameter
                if(planetDataObject.moon[x].toEcliptic) this.objectGroupPlanet.add(this.orbitMoon[planetDataObject.moon[x].Name]);
                else this.objectGroupPlanetTilt.add(this.orbitMoon[planetDataObject.moon[x].Name]);

                //create the objectGroupMoon container
                this.objectGroupMoon[planetDataObject.moon[x].Name] = new THREE.Object3D();

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
//                this.planetDataObject.moon[x].node = 90;
//                this.planetDataObject.moon[x].i = 45;
//                this.planetDataObject.moon[x].omega = 0;
//                this.planetDataObject.moon[x].MJ2000_True = 0;
//                this.planetDataObject.moon[x].e = 0;

                //apply the moon orbit parameters to the objectGroupMoon and the orbitMoon
                this._alignOrbit( this.objectGroupMoon[planetDataObject.moon[x].Name] , planetDataObject.moon[x],this.orbitMoon[planetDataObject.moon[x].Name],(planetDataObject.a));
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
        }

        //apply the planet orbit parameters to the objectGroup and the orbit
        if(this.planetDataObject.Status != 'Sonne') this._alignOrbit( this.objectGroup ,this.planetDataObject, this.orbit);
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
    //              moonTranslateX: the difference of the cneter of the objectgroupMoon to the center of the objectGroup
    //                              only needed wenn a objectgroupMoon is provided to apply the eccentricity to the objectgroupMoon
    _alignOrbit : function(object,options,orbit,moonTranslateX){
        // Longitude of the ascending node, rotation axis: y
        var axis = new THREE.Vector3(0,1,0);
        var rotWorldMatrix = new THREE.Matrix4();
        rotWorldMatrix.makeRotationAxis(axis.normalize(), options.node*Math.PI/180);
        rotWorldMatrix.multiply(object.matrix); // pre-multiply
        object.matrix = rotWorldMatrix;
        object.rotation.setEulerFromRotationMatrix(object.matrix);


        // Inclination, rotation axis: center to ascending node
        var axis_x = Math.cos(options.node*Math.PI/180);
        var axis_y = 0;
        var axis_z = Math.sin(-options.node*Math.PI/180);
        axis = new THREE.Vector3(axis_x,axis_y,axis_z);
        rotWorldMatrix = new THREE.Matrix4();
        rotWorldMatrix.makeRotationAxis(axis.normalize(), options.i*Math.PI/180);
        rotWorldMatrix.multiply(object.matrix); // pre-multiply
        object.matrix = rotWorldMatrix;
        object.rotation.setEulerFromRotationMatrix(object.matrix);

        // Inclination orbit, rotation axis: center to ascending node
        if(orbit){
            rotWorldMatrix.multiply(orbit.matrix); // pre-multiply
            orbit.matrix = rotWorldMatrix;
            orbit.rotation.setEulerFromRotationMatrix(orbit.matrix);
        }

        // Argument of perihelion, rotation axis: perpendicular to the orbit
        axis_y = Math.cos(options.i*Math.PI/180);
        axis_x = Math.sin(options.i*Math.PI/180) * Math.sin(options.node*Math.PI/180);
        axis_z = Math.sin(options.i*Math.PI/180) * Math.cos(-options.node*Math.PI/180);
        var rotAxis = new THREE.Vector3(axis_x,axis_y,axis_z);
        rotAxis.normalize();
        rotWorldMatrix = new THREE.Matrix4();
        rotWorldMatrix.makeRotationAxis(rotAxis, (parseFloat(options.omega))*Math.PI/180);
        rotWorldMatrix.multiply(object.matrix); // pre-multiply
        object.matrix = rotWorldMatrix;
        object.rotation.setEulerFromRotationMatrix(object.matrix);


        // Eccentricity ------------------------------------------------------------------------------------------------
        // !!We need to update the world matrix of the object to apply all previous rotations
        // !!otherwise we get a wrong position for the perihelion
        object.updateMatrixWorld();

        // Get the Vector from the center to the perihelion
        var perihel = new THREE.Vector3();
        perihel.getPositionFromMatrix(object.children[0].matrixWorld);

        // Set the amount of the shift
        // !!If the object was alredy translated by a other operation
        // !!we have to move the vector for the eccentricity shift as well
        if(moonTranslateX){
            perihel.x -= moonTranslateX;
            perihel.setLength(parseFloat(options.a*options.e));
        }
        else{
            perihel.setLength((options.a*options.e));
        }

        // Apply eccentricity
        object.position.add(perihel.clone().negate());
        if(orbit) orbit.position.add(perihel.clone().negate());
        //--------------------------------------------------------------------------------------------------------------


        // True anomaly, rotation axis: perpendicular to the orbit
        rotWorldMatrix = new THREE.Matrix4();
        rotWorldMatrix.makeRotationAxis(rotAxis, (parseFloat(options.MJ2000_True))*Math.PI/180);
        rotWorldMatrix.multiply(object.matrix); // pre-multiply
        object.matrix = rotWorldMatrix;
        object.rotation.setEulerFromRotationMatrix(object.matrix);


        // Create the rotation matrix for the animation function
        var rotWorldMatrixForwardSpeed1 = new THREE.Matrix4();
        var rotWorldMatrixBackwardSpeed1 = new THREE.Matrix4();
        var rotWorldMatrixForwardSpeed2 = new THREE.Matrix4();
        var rotWorldMatrixBackwardSpeed2 = new THREE.Matrix4();
        var rotWorldMatrixForwardSpeed3 = new THREE.Matrix4();
        var rotWorldMatrixBackwardSpeed3 = new THREE.Matrix4();
        if(moonTranslateX){
            // for a monn
            rotWorldMatrixForwardSpeed1.makeRotationAxis(rotAxis, (2*Math.PI) / options.Periode * (this.daysSpeed1));
            rotWorldMatrixBackwardSpeed1.makeRotationAxis(rotAxis, - (2*Math.PI) / options.Periode * (this.daysSpeed1));
            this.rotWorldMatrixMoonForwardSpeed1[options.Name] = rotWorldMatrixForwardSpeed1;
            this.rotWorldMatrixMoonBackwardSpeed1[options.Name] = rotWorldMatrixBackwardSpeed1;
            rotWorldMatrixForwardSpeed2.makeRotationAxis(rotAxis, (2*Math.PI) / options.Periode * (this.daysSpeed2));
            rotWorldMatrixBackwardSpeed2.makeRotationAxis(rotAxis, - (2*Math.PI) / options.Periode * (this.daysSpeed2));
            this.rotWorldMatrixMoonForwardSpeed2[options.Name] = rotWorldMatrixForwardSpeed2;
            this.rotWorldMatrixMoonBackwardSpeed2[options.Name] = rotWorldMatrixBackwardSpeed2;
            rotWorldMatrixForwardSpeed3.makeRotationAxis(rotAxis, (2*Math.PI) / options.Periode * (this.daysSpeed3));
            rotWorldMatrixBackwardSpeed3.makeRotationAxis(rotAxis, - (2*Math.PI) / options.Periode * (this.daysSpeed3));
            this.rotWorldMatrixMoonForwardSpeed3[options.Name] = rotWorldMatrixForwardSpeed3;
            this.rotWorldMatrixMoonBackwardSpeed3[options.Name] = rotWorldMatrixBackwardSpeed3;
            // save the rotation axis (perpendicular to the orbit)
            this.rotAxisMoon[options.Name] = rotAxis;
        }
        else{
            // for a planet
            rotWorldMatrixForwardSpeed1.makeRotationAxis(rotAxis, (2*Math.PI) * (this.daysSpeed1) / options.Periode);
            rotWorldMatrixBackwardSpeed1.makeRotationAxis(rotAxis, - (2*Math.PI) * (this.daysSpeed1) / options.Periode);
            this.rotWorldMatrixForwardSpeed1 = rotWorldMatrixForwardSpeed1;
            this.rotWorldMatrixBackwardSpeed1 = rotWorldMatrixBackwardSpeed1;
            rotWorldMatrixForwardSpeed2.makeRotationAxis(rotAxis, (2*Math.PI) * (this.daysSpeed2) / options.Periode);
            rotWorldMatrixBackwardSpeed2.makeRotationAxis(rotAxis, - (2*Math.PI) * (this.daysSpeed2) / options.Periode);
            this.rotWorldMatrixForwardSpeed2 = rotWorldMatrixForwardSpeed2;
            this.rotWorldMatrixBackwardSpeed2 = rotWorldMatrixBackwardSpeed2;
            rotWorldMatrixForwardSpeed3.makeRotationAxis(rotAxis, (2*Math.PI) * (this.daysSpeed3)  / options.Periode);
            rotWorldMatrixBackwardSpeed3.makeRotationAxis(rotAxis, - (2*Math.PI) * (this.daysSpeed3) / options.Periode);
            this.rotWorldMatrixForwardSpeed3 = rotWorldMatrixForwardSpeed3;
            this.rotWorldMatrixBackwardSpeed3 = rotWorldMatrixBackwardSpeed3;
            // save the rotation axis (perpendicular to the orbit)
            this.rotAxis = rotAxis;
        }
    },
    //rotate the planet and the moons forward
    //Parameters: speed: 1,2,3
    //              animateMoons: true/false
    //              animateRotation: true/false (rotation of the planet around the planet rotation axis)
    updateForward : function(speed,animateMoons,animateRotation){
        var rotWorldMatrix;
        if(this.rotWorldMatrixForwardSpeed1){
            //planet rotation on orbit
            if(speed == 2) rotWorldMatrix = this.rotWorldMatrixForwardSpeed2.clone();
            else if(speed == 3) rotWorldMatrix = this.rotWorldMatrixForwardSpeed3.clone();
            else rotWorldMatrix = this.rotWorldMatrixForwardSpeed1.clone();

            rotWorldMatrix.multiply(this.objectGroup.matrix); // pre-multiply
            this.objectGroup.matrix = rotWorldMatrix;
            this.objectGroup.rotation.setEulerFromRotationMatrix(this.objectGroup.matrix);

            //rotate the objectGroupPlanet to keep the heading with the x axis
            if(speed == 2) rotWorldMatrix = this.rotWorldMatrixBackwardSpeed2.clone();
            else if(speed == 3) rotWorldMatrix = this.rotWorldMatrixBackwardSpeed3.clone();
            else rotWorldMatrix = this.rotWorldMatrixBackwardSpeed1.clone();

            rotWorldMatrix.multiply(this.objectGroupPlanet.matrix); // pre-multiply
            this.objectGroupPlanet.matrix = rotWorldMatrix;
            this.objectGroupPlanet.rotation.setEulerFromRotationMatrix(this.objectGroupPlanet.matrix);

            if(animateRotation && this.planetDataObject.Rotation){
                //rotate the planet around the planets rotation axis,
                if(speed == 2) this.planetMesh.rotation.y += 2 * Math.PI * this.daysSpeed2 / this.planetDataObject.Rotation;
                else if(speed == 3) this.planetMesh.rotation.y += 2 * Math.PI * this.daysSpeed3 / this.planetDataObject.Rotation;
                else this.planetMesh.rotation.y += 2 * Math.PI * this.daysSpeed1 / this.planetDataObject.Rotation;
            }
        }

        if(animateMoons && this.rotWorldMatrixMoonForwardSpeed1){
            for(var x in this.rotWorldMatrixMoonForwardSpeed1){
                //moon rotations
                if(this.planetDataObject.moon[x].varNode){
                    var days;
                    if(speed == 2) days = this.daysSpeed2;
                    else if(speed == 3) days = this.daysSpeed3;
                    else days = this.daysSpeed1;

                    //apply a change of the Longitude of the ascending node to the moon
                    rotWorldMatrix = new THREE.Matrix4();
                    rotWorldMatrix.makeRotationAxis(new THREE.Vector3(0,1,0), (days/365.2425) * this.planetDataObject.moon[x].varNode * (Math.PI/180));
                    rotWorldMatrix.multiply(this.objectGroupMoon[x].matrix); // pre-multiply
                    this.objectGroupMoon[x].matrix = rotWorldMatrix;
                    this.objectGroupMoon[x].rotation.setEulerFromRotationMatrix(this.objectGroupMoon[x].matrix);

                    //apply a change of the Longitude of the ascending node to the moon orbit
                    rotWorldMatrix = new THREE.Matrix4();
                    rotWorldMatrix.makeRotationAxis(new THREE.Vector3(0,1,0), (days/365.2425) * this.planetDataObject.moon[x].varNode * (Math.PI/180));
                    rotWorldMatrix.multiply(this.orbitMoon[x].matrix); // pre-multiply
                    this.orbitMoon[x].matrix = rotWorldMatrix;
                    this.orbitMoon[x].rotation.setEulerFromRotationMatrix(this.orbitMoon[x].matrix);

                    //adjust the moon rotation axis
                    rotWorldMatrix = new THREE.Matrix4();
                    rotWorldMatrix.makeRotationAxis(new THREE.Vector3(0,1,0), (days/365.2425) * this.planetDataObject.moon[x].varNode * (Math.PI/180));
                    this.rotAxisMoon[x].applyMatrix4( rotWorldMatrix );

                    //moon rotation on orbit, with adjusted rotation axis
                    rotWorldMatrix = new THREE.Matrix4();
                    rotWorldMatrix.makeRotationAxis(this.rotAxisMoon[x], (2*Math.PI) / this.planetDataObject.moon[x].Periode * (days));
                    rotWorldMatrix.multiply(this.objectGroupMoon[x].matrix); // pre-multiply
                    this.objectGroupMoon[x].matrix = rotWorldMatrix;
                    this.objectGroupMoon[x].rotation.setEulerFromRotationMatrix(this.objectGroupMoon[x].matrix);

                }
                else{
                    //moon rotation on orbit
                    if(speed == 2) rotWorldMatrix = this.rotWorldMatrixMoonForwardSpeed2[x].clone();
                    else if(speed == 3) rotWorldMatrix = this.rotWorldMatrixMoonForwardSpeed3[x].clone();
                    else rotWorldMatrix = this.rotWorldMatrixMoonForwardSpeed1[x].clone();

                    rotWorldMatrix.multiply(this.objectGroupMoon[x].matrix);
                    this.objectGroupMoon[x].matrix = rotWorldMatrix;
                    this.objectGroupMoon[x].rotation.setEulerFromRotationMatrix(this.objectGroupMoon[x].matrix);
                }

                if(this.planetDataObject.moon[x].varOmega){
                    var days;
                    if(speed == 2) days = this.daysSpeed2;
                    else if(speed == 3) days = this.daysSpeed3;
                    else days = this.daysSpeed1;

                    //apply a change of the Argument of perihelion
                    rotWorldMatrix = new THREE.Matrix4();
                    rotWorldMatrix.makeRotationAxis(this.rotAxisMoon[x], (days/365.2425) * this.planetDataObject.moon[x].varOmega * (Math.PI/180));
                    rotWorldMatrix.multiply(this.objectGroupMoon[x].matrix); // pre-multiply
                    this.objectGroupMoon[x].matrix = rotWorldMatrix;
                    this.objectGroupMoon[x].rotation.setEulerFromRotationMatrix(this.objectGroupMoon[x].matrix);
                }
            }
        }
    },
    //rotate the planet and the moons backward
    //Parameters: speed: 1,2,3
    //              animateMoons: true/false
    //              animateRotation: true/false (rotation of the planet around the planet rotation axis)
    updateBackward : function(speed,animateMoons,animateRotation){
        var rotWorldMatrix;
        if(this.rotWorldMatrixBackwardSpeed1){
            //planet rotation on orbit
            if(speed == 2) rotWorldMatrix = this.rotWorldMatrixBackwardSpeed2.clone();
            else if(speed == 3) rotWorldMatrix = this.rotWorldMatrixBackwardSpeed3.clone();
            else rotWorldMatrix = this.rotWorldMatrixBackwardSpeed1.clone();

            rotWorldMatrix.multiply(this.objectGroup.matrix); // pre-multiply
            this.objectGroup.matrix = rotWorldMatrix;
            this.objectGroup.rotation.setEulerFromRotationMatrix(this.objectGroup.matrix);

            //rotate the objectGroupPlanet to keep the heading with the x axis
            if(speed == 2) rotWorldMatrix = this.rotWorldMatrixForwardSpeed2.clone();
            else if(speed == 3) rotWorldMatrix = this.rotWorldMatrixForwardSpeed3.clone();
            else rotWorldMatrix = this.rotWorldMatrixForwardSpeed1.clone();

            rotWorldMatrix.multiply(this.objectGroupPlanet.matrix); // pre-multiply
            this.objectGroupPlanet.matrix = rotWorldMatrix;
            this.objectGroupPlanet.rotation.setEulerFromRotationMatrix(this.objectGroupPlanet.matrix);

            if(animateRotation && this.planetDataObject.Rotation){
                //rotate the planet around the planets rotation axis,
                if(speed == 2) this.planetMesh.rotation.y -= 2 * Math.PI * this.daysSpeed2 / this.planetDataObject.Rotation;
                else if(speed == 3) this.planetMesh.rotation.y -= 2 * Math.PI * this.daysSpeed3 / this.planetDataObject.Rotation;
                else this.planetMesh.rotation.y -= 2 * Math.PI * this.daysSpeed1 / this.planetDataObject.Rotation;
            }
        }

        if(animateMoons && this.rotWorldMatrixMoonBackwardSpeed1){
            for(var x in this.rotWorldMatrixMoonBackwardSpeed1){
                //moon rotations
                if(this.planetDataObject.moon[x].varNode){
                    var days;
                    if(speed == 2) days = this.daysSpeed2;
                    else if(speed == 3) days = this.daysSpeed3;
                    else days = this.daysSpeed1;

                    //apply a change of the Longitude of the ascending node to the moon
                    rotWorldMatrix = new THREE.Matrix4();
                    rotWorldMatrix.makeRotationAxis(new THREE.Vector3(0,1,0), (days/365.2425) * -this.planetDataObject.moon[x].varNode * (Math.PI/180));
                    rotWorldMatrix.multiply(this.objectGroupMoon[x].matrix); // pre-multiply
                    this.objectGroupMoon[x].matrix = rotWorldMatrix;
                    this.objectGroupMoon[x].rotation.setEulerFromRotationMatrix(this.objectGroupMoon[x].matrix);

                    //apply a change of the Longitude of the ascending node to the moon orbit
                    rotWorldMatrix = new THREE.Matrix4();
                    rotWorldMatrix.makeRotationAxis(new THREE.Vector3(0,1,0), (days/365.2425) * -this.planetDataObject.moon[x].varNode * (Math.PI/180));
                    rotWorldMatrix.multiply(this.orbitMoon[x].matrix); // pre-multiply
                    this.orbitMoon[x].matrix = rotWorldMatrix;
                    this.orbitMoon[x].rotation.setEulerFromRotationMatrix(this.orbitMoon[x].matrix);

                    //adjust the moon rotation axis
                    rotWorldMatrix = new THREE.Matrix4();
                    rotWorldMatrix.makeRotationAxis(new THREE.Vector3(0,1,0), (days/365.2425) * -this.planetDataObject.moon[x].varNode * (Math.PI/180));
                    this.rotAxisMoon[x].applyMatrix4( rotWorldMatrix );

                    //moon rotation on orbit, with adjusted rotation axis
                    rotWorldMatrix = new THREE.Matrix4();
                    rotWorldMatrix.makeRotationAxis(this.rotAxisMoon[x], (-1) * (2*Math.PI) / this.planetDataObject.moon[x].Periode * (days));
                    rotWorldMatrix.multiply(this.objectGroupMoon[x].matrix); // pre-multiply
                    this.objectGroupMoon[x].matrix = rotWorldMatrix;
                    this.objectGroupMoon[x].rotation.setEulerFromRotationMatrix(this.objectGroupMoon[x].matrix);
                }
                else{
                    //moon rotation on orbit
                    if(speed == 2) rotWorldMatrix = this.rotWorldMatrixMoonBackwardSpeed2[x].clone();
                    else if(speed == 3) rotWorldMatrix = this.rotWorldMatrixMoonBackwardSpeed3[x].clone();
                    else rotWorldMatrix = this.rotWorldMatrixMoonBackwardSpeed1[x].clone();

                    rotWorldMatrix.multiply(this.objectGroupMoon[x].matrix);
                    this.objectGroupMoon[x].matrix = rotWorldMatrix;
                    this.objectGroupMoon[x].rotation.setEulerFromRotationMatrix(this.objectGroupMoon[x].matrix);
                }

                if(this.planetDataObject.moon[x].varOmega){
                    var days;
                    if(speed == 2) days = this.daysSpeed2;
                    else if(speed == 3) days = this.daysSpeed3;
                    else days = this.daysSpeed1;

                    //apply a change of the Argument of perihelion
                    rotWorldMatrix = new THREE.Matrix4();
                    rotWorldMatrix.makeRotationAxis(this.rotAxisMoon[x], (days/365.2425) * -this.planetDataObject.moon[x].varOmega * (Math.PI/180));
                    rotWorldMatrix.multiply(this.objectGroupMoon[x].matrix); // pre-multiply
                    this.objectGroupMoon[x].matrix = rotWorldMatrix;
                    this.objectGroupMoon[x].rotation.setEulerFromRotationMatrix(this.objectGroupMoon[x].matrix);
                }

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
        //planet rotation on orbit
        var rotWorldMatrix = new THREE.Matrix4();
        rotWorldMatrix.makeRotationAxis(this.rotAxis, (days*2*Math.PI) / this.planetDataObject.Periode);
        rotWorldMatrix.multiply(this.objectGroup.matrix); // pre-multiply
        this.objectGroup.matrix = rotWorldMatrix;
        this.objectGroup.rotation.setEulerFromRotationMatrix(this.objectGroup.matrix);

        //rotate the objectGroupPlanet to keep the heading with the x axis
        rotWorldMatrix = new THREE.Matrix4();
        rotWorldMatrix.makeRotationAxis(this.rotAxis, (-1) * (days*2*Math.PI) / this.planetDataObject.Periode);
        rotWorldMatrix.multiply(this.objectGroupPlanet.matrix); // pre-multiply
        this.objectGroupPlanet.matrix = rotWorldMatrix;
        this.objectGroupPlanet.rotation.setEulerFromRotationMatrix(this.objectGroupPlanet.matrix);

        //moon rotations
        for(var x in this.rotAxisMoon){
            if(this.planetDataObject.moon[x].varNode){
                //apply a change of the Longitude of the ascending node to the moon
                rotWorldMatrix = new THREE.Matrix4();
                rotWorldMatrix.makeRotationAxis(new THREE.Vector3(0,1,0), (days/365.2425) * this.planetDataObject.moon[x].varNode * (Math.PI/180));
                rotWorldMatrix.multiply(this.objectGroupMoon[x].matrix); // pre-multiply
                this.objectGroupMoon[x].matrix = rotWorldMatrix;
                this.objectGroupMoon[x].rotation.setEulerFromRotationMatrix(this.objectGroupMoon[x].matrix);

                //apply a change of the Longitude of the ascending node to the moon orbit
                rotWorldMatrix = new THREE.Matrix4();
                rotWorldMatrix.makeRotationAxis(new THREE.Vector3(0,1,0), (days/365.2425) * this.planetDataObject.moon[x].varNode * (Math.PI/180));
                rotWorldMatrix.multiply(this.orbitMoon[x].matrix); // pre-multiply
                this.orbitMoon[x].matrix = rotWorldMatrix;
                this.orbitMoon[x].rotation.setEulerFromRotationMatrix(this.orbitMoon[x].matrix);

                //adjust the moon rotation axis
                rotWorldMatrix = new THREE.Matrix4();
                rotWorldMatrix.makeRotationAxis(new THREE.Vector3(0,1,0), (days/365.2425) * this.planetDataObject.moon[x].varNode * (Math.PI/180));
                this.rotAxisMoon[x].applyMatrix4( rotWorldMatrix );
            }

            //moon rotation on orbit
            rotWorldMatrix = new THREE.Matrix4();
            rotWorldMatrix.makeRotationAxis(this.rotAxisMoon[x], (days*2*Math.PI) / this.planetDataObject.moon[x].Periode);
            rotWorldMatrix.multiply(this.objectGroupMoon[x].matrix); // pre-multiply
            this.objectGroupMoon[x].matrix = rotWorldMatrix;
            this.objectGroupMoon[x].rotation.setEulerFromRotationMatrix(this.objectGroupMoon[x].matrix);


            if(this.planetDataObject.moon[x].varOmega){
                //apply a change of the Argument of perihelion
                rotWorldMatrix = new THREE.Matrix4();
                rotWorldMatrix.makeRotationAxis(this.rotAxisMoon[x], (days/365.2425) * this.planetDataObject.moon[x].varOmega * (Math.PI/180));
                rotWorldMatrix.multiply(this.objectGroupMoon[x].matrix); // pre-multiply
                this.objectGroupMoon[x].matrix = rotWorldMatrix;
                this.objectGroupMoon[x].rotation.setEulerFromRotationMatrix(this.objectGroupMoon[x].matrix);
            }
        }
    }
});
