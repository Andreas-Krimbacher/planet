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
//        this.planetDataObject.MJ2000 = 0;
        this._createObjectGroup();
        this._createOrbit();
        this._alignOrbit();
        if(planetDataObject.Periode) this._createRotMatrix();

    },

    _createObjectGroup : function(){
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

        mesh.position.x = this.scaleDist(planetDataObject.a);

        this.objectGroup.add(mesh);

        this.planetMesh = mesh;


        if(planetDataObject.moon){

            this.objectGroupMoon = new THREE.Object3D();

            if(planetDataObject.moon.Mond){
            // create the sphere's material
            if(planetDataObject.moon.Mond.img){
                var texture = THREE.ImageUtils.loadTexture(this.IMAGE_PATH + planetDataObject.moon.Mond.img);
                var material = new THREE.MeshBasicMaterial( { map: texture } );
            }
            else{
                var material = new THREE.MeshLambertMaterial(
                    {
                        color: 0xE8251E
                    });
            }

            var meshMoon = new THREE.Mesh(
                new THREE.SphereGeometry(this.scaleRadius(planetDataObject.moon.Mond.Durchm1), this.segments, this.rings),
                material);

            meshMoon.position.x = this.scaleDist(parseFloat(planetDataObject.moon.Mond.a))+20;

                this.objectGroupMoon.add(meshMoon);

                this.objectGroupMoon.translateX(this.scaleDist(planetDataObject.a));

                this.objectGroup.add(this.objectGroupMoon);

            }

        }

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
        this.orbit.add(new THREE.Line( geometry, material ));



    },

    _alignOrbit : function(){

        // node
        var axis = new THREE.Vector3(0,1,0);
        var rotWorldMatrix = new THREE.Matrix4();
        rotWorldMatrix.makeRotationAxis(axis.normalize(), this.planetDataObject.node*Math.PI/180);
        rotWorldMatrix.multiply(this.objectGroup.matrix);        // pre-multiply
        this.objectGroup.matrix = rotWorldMatrix;
        this.objectGroup.rotation.setEulerFromRotationMatrix(this.objectGroup.matrix);

        // i
        var axis_x = Math.cos(this.planetDataObject.node*Math.PI/180);
        var axis_y = Math.sin(this.planetDataObject.node*Math.PI/180);
        var axis = new THREE.Vector3(axis_x,0,axis_y);
        var rotWorldMatrix = new THREE.Matrix4();
        rotWorldMatrix.makeRotationAxis(axis.normalize(), this.planetDataObject.i*Math.PI/180);

        rotWorldMatrix.multiply(this.objectGroup.matrix);        // pre-multiply
        this.objectGroup.matrix = rotWorldMatrix;
        this.objectGroup.rotation.setEulerFromRotationMatrix(this.objectGroup.matrix);

        // i orbit
        rotWorldMatrix.multiply(this.orbit.matrix);        // pre-multiply
        this.orbit.matrix = rotWorldMatrix;
        this.orbit.rotation.setEulerFromRotationMatrix(this.orbit.matrix);


        //M
        var axis_z = Math.cos(this.planetDataObject.i*Math.PI/180);
        axis_x = Math.sin(this.planetDataObject.i*Math.PI/180) * Math.sin(-this.planetDataObject.node*Math.PI/180);
        axis_y = Math.sin(this.planetDataObject.i*Math.PI/180) * Math.cos(-this.planetDataObject.node*Math.PI/180);

        var axis = new THREE.Vector3(axis_x,axis_z,axis_y);
        var rotWorldMatrix = new THREE.Matrix4();
        rotWorldMatrix.makeRotationAxis(axis.normalize(), this.planetDataObject.MJ2000*Math.PI/180);

        rotWorldMatrix.multiply(this.objectGroup.matrix);        // pre-multiply
        this.objectGroup.matrix = rotWorldMatrix;
        this.objectGroup.rotation.setEulerFromRotationMatrix(this.objectGroup.matrix);

    },

    _createRotMatrix : function(){
        var axis_z = Math.cos(this.planetDataObject.i*Math.PI/180);
        var axis_x = Math.sin(this.planetDataObject.i*Math.PI/180) * Math.sin(-this.planetDataObject.node*Math.PI/180);
        var axis_y = Math.sin(this.planetDataObject.i*Math.PI/180) * Math.cos(-this.planetDataObject.node*Math.PI/180);

        var axis = new THREE.Vector3(axis_x,axis_z,axis_y);
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

            rotWorldMatrix2.multiply(this.objectGroupMoon.matrix);        // pre-multiply
            this.objectGroupMoon.matrix = rotWorldMatrix2;
            this.objectGroupMoon.rotation.setEulerFromRotationMatrix(this.objectGroupMoon.matrix);


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