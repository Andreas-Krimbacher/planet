PS.lib.Planet = Class.extend({
    // ==== variables ====

    CLASS_NAME: "PS.Planet",

    IMAGE_PATH : 'img/',

    planetDataObject : null,

    planetMesh : null,

    objectGroup : null,

    objectGroupMoon : null,

    orbit : null,

    orbitMoon : null,

    rotMatrix : null,

    rotMatrixMoon : null,

    segments : 16,

    segmentsOrbit : 50,

    rings : 16,

    angle : 0,

    camera : null,

    distScale : null,
    radiusScale : null,
    periodScale : null,
    distScaleMoon : null,
    radiusScaleMoon : null,
    periodScaleMoon : null,


    // ==== functions ====
    init : function(planetDataObject){

        this.distScale = {type: "linear", value : 1000};
        this.radiusScale = {type: "linear", value : 500};
        this.periodScale = {type: "linear", value : 10};
        this.distScaleMoon = {type: "linear", value : 30};
        this.radiusScaleMoon = {type: "linear", value : 300};
        this.periodScaleMoon = {type: "linear", value : 0.1};


        this.planetDataObject = planetDataObject;
//        this.planetDataObject.node = 0;
//        this.planetDataObject.i = 0;
//        this.planetDataObject.w = 0;
//        this.planetDataObject.MJ2000 = 0;
//        this.planetDataObject.e = -0.5;
        this._createPlanet();

    },

    _createPlanet : function(){
        var planetDataObject = this.planetDataObject;

        // create the sphere's material
        if(planetDataObject.img){
            var texture = THREE.ImageUtils.loadTexture(this.IMAGE_PATH + planetDataObject.img);
            var material = new THREE.MeshBasicMaterial( { map: texture } );
        }
        else{
            var material = new THREE.MeshLambertMaterial(
                {
                    color: 0xE8251E
                });
        }

        var mesh = new THREE.Mesh(
            new THREE.SphereGeometry(this.scaleRadius(planetDataObject.Durchm1/2), this.segments, this.rings),
            material);

        this.objectGroup = new THREE.Object3D();

        mesh.position.x = this.scaleDist(planetDataObject.a);

        this.objectGroup.add(mesh);

        this.planetMesh = mesh;

        if(this.planetDataObject.Status != 'Sonne') this.orbit = this._createOrbit(this.scaleDist(planetDataObject.a));



        if(planetDataObject.moon){

            this.objectGroupMoon = {};
            this.orbitMoon = {};
            this.rotMatrixMoon = {};
            var moon,meshMoon;

            for(var x in planetDataObject.moon){
                moon = new THREE.Object3D();
                // create the sphere's material
                if(planetDataObject.moon[x].img){
                    var texture = THREE.ImageUtils.loadTexture(this.IMAGE_PATH + planetDataObject.moon[x].img);
                    var material = new THREE.MeshBasicMaterial( { map: texture } );
                }
                else{
                    var material = new THREE.MeshLambertMaterial({color: 0xE8251E});
                }

                meshMoon = new THREE.Mesh(
                    new THREE.SphereGeometry(this.scaleRadiusMoon(planetDataObject.moon[x].Durchm1/2), this.segments, this.rings),
                    material);

                meshMoon.position.x = this.scaleDistMoon(parseFloat(planetDataObject.moon[x].a))+this.scaleRadius(planetDataObject.Durchm1/2);
                moon.add(meshMoon);
                moon.translateX(this.scaleDist(planetDataObject.a));

                this.objectGroupMoon[planetDataObject.moon[x].Name] = moon;
                this.objectGroup.add(moon);

                this.orbitMoon[planetDataObject.moon[x].Name] = this._createOrbit(this.scaleDistMoon(planetDataObject.moon[x].a)+this.scaleRadius(planetDataObject.Durchm1/2));
                this.orbitMoon[planetDataObject.moon[x].Name].translateX(this.scaleDist(planetDataObject.a));
                this.objectGroup.add(this.orbitMoon[planetDataObject.moon[x].Name]);

//                        this.planetDataObject.moon[x].node = 0;
//                       this.planetDataObject.moon[x].i = 45;
//                        this.planetDataObject.moon[x].w = 0;
//                        this.planetDataObject.moon[x].MJ2000 = 0;
//                        this.planetDataObject.moon[x].e = 0.4;

                this.rotMatrixMoon[planetDataObject.moon[x].Name] = this._alignOrbit( moon , planetDataObject.moon[x],this.orbitMoon[planetDataObject.moon[x].Name],this.scaleDist(planetDataObject.a));

            }
        }

        if(this.planetDataObject.Status != 'Sonne') this.rotMatrix = this._alignOrbit( this.objectGroup ,this.planetDataObject, this.orbit);

    },

    _createOrbit : function(a){
        // Create an empty geometry object to hold the line vertex data
        var geometry = new THREE.Geometry();

        // Create points along the circumference of a circle with radius == distance
        var i, len = 60, twopi = 2 * Math.PI;
        for (i = 0; i <= this.segmentsOrbit; i++)
        {
            var x = a * Math.cos( i / this.segmentsOrbit * twopi );
            var z = a * Math.sin( i / this.segmentsOrbit * twopi );
            var vertex = new THREE.Vector3(x, 0, z);
            geometry.vertices.push(vertex);
        }

        geometry.computeLineDistances();

        var material = new THREE.LineDashedMaterial( { color: 0xffaa00, dashSize: 3, gapSize: 10, linewidth: 2 }, THREE.LinePieces );
        var orbit = new THREE.Object3D();
        orbit.add(new THREE.Line( geometry, material ));

        return orbit

    },

    _alignOrbit : function(object,options,orbit,moonTranslateX){

        // node
        var axis = new THREE.Vector3(0,1,0);
        var rotWorldMatrix = new THREE.Matrix4();
        rotWorldMatrix.makeRotationAxis(axis.normalize(), options.node*Math.PI/180);
        rotWorldMatrix.multiply(object.matrix);        // pre-multiply
        object.matrix = rotWorldMatrix;
        object.rotation.setEulerFromRotationMatrix(object.matrix);

        // i
        var axis_x = Math.cos(options.node*Math.PI/180);
        var axis_y = 0;
        var axis_z = Math.sin(-options.node*Math.PI/180);
        axis = new THREE.Vector3(axis_x,axis_y,axis_z);
        rotWorldMatrix = new THREE.Matrix4();
        rotWorldMatrix.makeRotationAxis(axis.normalize(), options.i*Math.PI/180);

        rotWorldMatrix.multiply(object.matrix);        // pre-multiply
        object.matrix = rotWorldMatrix;
        object.rotation.setEulerFromRotationMatrix(object.matrix);

        // i orbit
        if(orbit){
            rotWorldMatrix.multiply(orbit.matrix);        // pre-multiply
            orbit.matrix = rotWorldMatrix;
            orbit.rotation.setEulerFromRotationMatrix(orbit.matrix);

        }


        //w
        axis_y = Math.cos(options.i*Math.PI/180);
        axis_x = Math.sin(options.i*Math.PI/180) * Math.sin(options.node*Math.PI/180);
        axis_z = Math.sin(options.i*Math.PI/180) * Math.cos(-options.node*Math.PI/180);
        var rotAxis = new THREE.Vector3(axis_x,axis_y,axis_z);
        rotAxis.normalize();

        rotWorldMatrix = new THREE.Matrix4();
        rotWorldMatrix.makeRotationAxis(rotAxis, (parseFloat(options.w))*Math.PI/180);

        rotWorldMatrix.multiply(object.matrix);        // pre-multiply
        object.matrix = rotWorldMatrix;
        object.rotation.setEulerFromRotationMatrix(object.matrix);


        //e
        object.updateMatrixWorld();
        var perihel = new THREE.Vector3();
        perihel.getPositionFromMatrix(object.children[0].matrixWorld);

        //line from center to perihel
        var geometry = new THREE.Geometry();
        if(moonTranslateX) geometry.vertices.push(new THREE.Vector3(moonTranslateX, 0, 0));
        else geometry.vertices.push(new THREE.Vector3(0, 0, 0));
        geometry.vertices.push(perihel.clone().setLength(perihel.length() - this.scaleDist(options.a*options.e)));

        material = new THREE.LineBasicMaterial( { color: 0xffffcc, opacity: .5, linewidth: 2 } );
        this.perihelLine = new THREE.Line( geometry, material );


        //e translation
        if(moonTranslateX){
            perihel.x -= moonTranslateX;
            perihel.setLength(this.scaleDistMoon(options.a*options.e));
        }
        else{
            perihel.setLength(this.scaleDist(options.a*options.e));
        }


        object.position.add(perihel.clone().negate());
        if(orbit) orbit.position.add(perihel.clone().negate());

        //MJ2000
        rotWorldMatrix = new THREE.Matrix4();
        rotWorldMatrix.makeRotationAxis(rotAxis, (parseFloat(options.MJ2000))*Math.PI/180);

        rotWorldMatrix.multiply(object.matrix);        // pre-multiply
        object.matrix = rotWorldMatrix;
        object.rotation.setEulerFromRotationMatrix(object.matrix);

        //return rotationMatrix
        rotWorldMatrix = new THREE.Matrix4();
        if(moonTranslateX) rotWorldMatrix.makeRotationAxis(rotAxis,  this.scalePeriodMoon(options.Periode));
        else rotWorldMatrix.makeRotationAxis(rotAxis,  this.scalePeriod(options.Periode));

        return rotWorldMatrix;

    },

    scaleDist : function(dist){
        if(this.distScale.type == "linear") return dist/this.distScale.value;
    },
    scaleRadius : function(radius){
        if(this.radiusScale.type == "linear") return radius/this.radiusScale.value;
    },
    scalePeriod : function(period){
        if(this.periodScale.type == "linear") return (1/period) * this.periodScale.value;
    },

    scaleDistMoon : function(dist){
        if(this.distScale.type == "linear") return dist/this.distScaleMoon.value;
    },
    scaleRadiusMoon : function(radius){
        if(this.radiusScale.type == "linear") return radius/this.radiusScaleMoon.value;
    },
    scalePeriodMoon : function(period){
        if(this.periodScale.type == "linear") return (1/period) * this.periodScaleMoon.value;
    },

    getObjectGroup : function(){

        return this.objectGroup;

    },



    getOrbit : function(){
        return this.orbit;
    },

    update : function(){

        if(this.rotMatrix){
            var rotWorldMatrix = this.rotMatrix.clone();
            rotWorldMatrix.multiply(this.objectGroup.matrix);        // pre-multiply
            this.objectGroup.matrix = rotWorldMatrix;
            this.objectGroup.rotation.setEulerFromRotationMatrix(this.objectGroup.matrix);
        }

        if(this.planetDataObject.Revolution){
            this.planetMesh.rotation.y += this.scalePeriod(this.planetDataObject.Revolution)/100;
        }

        if(this.rotMatrixMoon){
            for(var x in this.rotMatrixMoon){
                rotWorldMatrix = this.rotMatrixMoon[x].clone();
                rotWorldMatrix.multiply(this.objectGroupMoon[x].matrix);
                this.objectGroupMoon[x].matrix = rotWorldMatrix;
                this.objectGroupMoon[x].rotation.setEulerFromRotationMatrix(this.objectGroupMoon[x].matrix);
            }
        }

        if(this.camera){

            var vectorToCenter = new THREE.Vector3();
            vectorToCenter.getPositionFromMatrix(this.objectGroup.children[0].matrixWorld);

            vectorToCenter.setLength(vectorToCenter.length()+(this.scaleRadius(this.planetDataObject.Durchm1*3)));
            vectorToCenter.y += (this.scaleRadius(this.planetDataObject.Durchm1))/3;

            this.camera.position = vectorToCenter;


        }


    },

    setCamera : function(camera){
        this.camera = camera;
    },

    removeCamera : function(camera){
        this.camera = null;
    }


});