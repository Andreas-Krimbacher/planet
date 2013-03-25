PS.lib.Planet = Class.extend({
    // ==== variables ====

    CLASS_NAME: "PS.Planet",

    IMAGE_PATH : 'img/',

    planetDataObject : null,

    objectGroup : null,

    segments : 16,

    segmentsOrbit : 50,

    rings : 16,

    angle : 0,

    distScale : null,
    radiusScale : null,


    // ==== functions ====
    init : function(planetDataObject){

        this.distScale = {type: "linear", value : 1000};
        this.radiusScale = {type: "linear", value : 1000};


        this.planetDataObject = planetDataObject;
        this._createObjectGroup();

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

        mesh.position.x = this.scaleDist(planetDataObject.a);
        mesh.position.y = 0;
        mesh.position.z = 0;

        this.objectGroup = new THREE.Object3D();
        this.objectGroup.add(mesh);
    },

    scaleDist : function(dist){
        if(this.distScale.type == "linear") return dist/this.distScale.value;
    },
    scaleRadius : function(radius){
        if(this.radiusScale.type == "linear") return radius/this.radiusScale.value;
    },

    getObjectGroup : function(){

        return this.objectGroup;

    },

    getOrbit : function(){
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

        material = new THREE.LineBasicMaterial( { color: 0xffffff, opacity: .5, linewidth: 2 } );

        // Create the line
        return new THREE.Line( geometry, material );
    },

    update : function(){

        if(this.planetDataObject.Periode){
            var axis = new THREE.Vector3(0,1,0);

            var rotWorldMatrix = new THREE.Matrix4();
            rotWorldMatrix.makeRotationAxis(axis.normalize(),  (1/this.planetDataObject.Periode)*10);
            rotWorldMatrix.multiply(this.objectGroup.matrix);        // pre-multiply
            this.objectGroup.matrix = rotWorldMatrix;
            this.objectGroup.rotation.setEulerFromRotationMatrix(this.objectGroup.matrix);
        }

//        if(this.revolutionSpeed){
//            this.mesh.rotation.y += this.revolutionSpeed;
//        }

    }


});