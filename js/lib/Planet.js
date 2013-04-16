PS.lib.Planet = Class.extend({
    // ==== variables ====

    CLASS_NAME: "PS.Planet",

    IMAGE_PATH : 'img/',

    planetDataObject : null,

    planetMesh : null,

    objectGroup : null,

    objectGroupMoon : null,

    orbit : null,

    rotMatrix : null,

    segments : 16,

    segmentsOrbit : 50,

    rings : 16,

    angle : 0,

    camera : null,

    distScale : null,
    radiusScale : null,
    periodScale : null,


    // ==== functions ====
    init : function(planetDataObject){

        this.distScale = {type: "linear", value : 1000};
        this.radiusScale = {type: "linear", value : 1000};
        this.periodScale = {type: "linear", value : 10};


        this.planetDataObject = planetDataObject;
//        this.planetDataObject.node = 0;
//        this.planetDataObject.i = 0;
//        this.planetDataObject.w = 0;
//        this.planetDataObject.MJ2000 = 0;
//        this.planetDataObject.e = -0.5;
        this._createPlanet();

        if(planetDataObject.Periode) this._createRotMatrix();

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
            new THREE.SphereGeometry(this.scaleRadius(planetDataObject.Durchm1), this.segments, this.rings),
            material);

        this.objectGroup = new THREE.Object3D();
        //this.objectGroup.matrixAutoUpdate = false;

        mesh.position.x = this.scaleDist(planetDataObject.a);

        this.objectGroup.add(mesh);

        this.planetMesh = mesh;

        this._createOrbit();
        this._alignOrbit( this.objectGroup ,this.planetDataObject,this.orbit);

//
//        if(planetDataObject.moon){
//
//            this.objectGroupMoon = [];
//            var moon,meshMoon;
//
//            for(var x in planetDataObject.moon){
//                moon = new THREE.Object3D();
//                // create the sphere's material
//                if(planetDataObject.moon[x].img){
//                    var texture = THREE.ImageUtils.loadTexture(this.IMAGE_PATH + planetDataObject.moon[x].img);
//                    var material = new THREE.MeshBasicMaterial( { map: texture } );
//                }
//                else{
//                    var material = new THREE.MeshLambertMaterial({color: 0xE8251E});
//                }
//
//                meshMoon = new THREE.Mesh(
//                    new THREE.SphereGeometry(this.scaleRadius(planetDataObject.moon[x].Durchm1), this.segments, this.rings),
//                    material);
//
//                meshMoon.position.x = this.scaleDist(parseFloat(planetDataObject.moon[x].a)*100);
//                moon.add(meshMoon);
//                moon.translateX(this.scaleDist(planetDataObject.a));
//                this.objectGroup.add(moon);
//                this.objectGroupMoon.push(moon);
//
//                this._alignOrbit( moon , planetDataObject.moon[x]);
//
//            }
//        }

    },

    _createOrbit : function(){
        // Create an empty geometry object to hold the line vertex data
        var geometry = new THREE.Geometry();

        // Create points along the circumference of a circle with radius == distance
        var i, len = 60, twopi = 2 * Math.PI;
        for (i = 0; i <= this.segmentsOrbit; i++)
        {
            var x = this.scaleDist(this.planetDataObject.a) * Math.cos( i / this.segmentsOrbit * twopi );
            var z = this.scaleDist(this.planetDataObject.a) * Math.sin( i / this.segmentsOrbit * twopi );
            var vertex = new THREE.Vector3(x, 0, z);
            geometry.vertices.push(vertex);
        }

        geometry.computeLineDistances();

        material = new THREE.LineDashedMaterial( { color: 0xffaa00, dashSize: 3, gapSize: 10, linewidth: 2 }, THREE.LinePieces );

        this.orbit =  new THREE.Object3D();
        //this.orbit.matrixAutoUpdate = false;
        this.orbit.add(new THREE.Line( geometry, material ));



    },

    _alignOrbit : function(object,options,orbit){



        // node
        var axis = new THREE.Vector3(0,1,0);
        var rotWorldMatrix = new THREE.Matrix4();
        rotWorldMatrix.makeRotationAxis(axis.normalize(), options.node*Math.PI/180);
        rotWorldMatrix.multiply(object.matrix);        // pre-multiply
        object.matrix = rotWorldMatrix;
        object.rotation.setEulerFromRotationMatrix(object.matrix);

        // i
        var axis_x = Math.cos(options.node*Math.PI/180);
        var axis_z = Math.sin(options.node*Math.PI/180);
        var axis = new THREE.Vector3(axis_x,0,axis_z);
        var rotWorldMatrix = new THREE.Matrix4();
        rotWorldMatrix.makeRotationAxis(axis.normalize(), options.i*Math.PI/180);

        rotWorldMatrix.multiply(object.matrix);        // pre-multiply
        object.matrix = rotWorldMatrix;
        object.rotation.setEulerFromRotationMatrix(object.matrix);

        // i orbit
        if(orbit){
            rotWorldMatrix.multiply(orbit.matrix);        // pre-multiply
            orbit.matrix = rotWorldMatrix;
            orbit.rotation.setEulerFromRotationMatrix(this.orbit.matrix);
        }


        //w
        axis_y = Math.cos(options.i*Math.PI/180);
        axis_x = Math.sin(options.i*Math.PI/180) * Math.sin(-options.node*Math.PI/180);
        var axis_z = Math.sin(options.i*Math.PI/180) * Math.cos(-options.node*Math.PI/180);

        var axis = new THREE.Vector3(axis_x,axis_y,axis_z);
        var rotWorldMatrix = new THREE.Matrix4();
        rotWorldMatrix.makeRotationAxis(axis.normalize(), (parseFloat(options.w))*Math.PI/180);

        rotWorldMatrix.multiply(object.matrix);        // pre-multiply
        object.matrix = rotWorldMatrix;
        object.rotation.setEulerFromRotationMatrix(object.matrix);

        //e
        object.updateMatrixWorld();
        //object.updateMatrix();

        var peri = new THREE.Vector3();
        peri.getPositionFromMatrix(object.children[0].matrixWorld);
        peri.setLength(this.scaleDist(options.a*options.e));


        object.position = peri.clone();
        orbit.position = peri.clone();


    },

    _createRotMatrix : function(){
        var axis_y = Math.cos(this.planetDataObject.i*Math.PI/180);
        var axis_x = Math.sin(this.planetDataObject.i*Math.PI/180) * Math.sin(-this.planetDataObject.node*Math.PI/180);
        var axis_z = Math.sin(this.planetDataObject.i*Math.PI/180) * Math.cos(-this.planetDataObject.node*Math.PI/180);

        var axis = new THREE.Vector3(axis_x,axis_y,axis_z);
        var rotWorldMatrix = new THREE.Matrix4();
        rotWorldMatrix.makeRotationAxis(axis.normalize(), this.scalePeriod(this.planetDataObject.Periode));

        this.rotMatrix = rotWorldMatrix;
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

        if(this.objectGroupMoon){

            var axis_z = Math.cos(45*Math.PI/180);
            var axis_x = Math.sin(45*Math.PI/180) * Math.sin(0*Math.PI/180);
            var axis_y = Math.sin(45*Math.PI/180) * Math.cos(0*Math.PI/180);

            var axis = new THREE.Vector3(axis_x,axis_z,axis_y);

            var rotWorldMatrix2 = new THREE.Matrix4();
            rotWorldMatrix2.makeRotationAxis(axis.normalize(), 0.1);

            rotWorldMatrix2.multiply(this.objectGroupMoon[0].matrix);        // pre-multiply
            this.objectGroupMoon[0].matrix = rotWorldMatrix2;
            this.objectGroupMoon[0].rotation.setEulerFromRotationMatrix(this.objectGroupMoon[0].matrix);


        }

        if(this.camera){

            var vectorToCenter = new THREE.Vector3();
            vectorToCenter.getPositionFromMatrix(this.objectGroup.children[0].matrixWorld);

            vectorToCenter.setLength(vectorToCenter.length()+(this.scaleRadius(this.planetDataObject.Durchm1)*10));
            vectorToCenter.y += (this.scaleRadius(this.planetDataObject.Durchm1))*3;

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