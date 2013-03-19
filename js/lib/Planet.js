PS.lib.Planet = Class.extend({
    // ==== variables ====

    CLASS_NAME: "PS.Planet",

    IMAGE_PATH : 'img/',

    mesh : null,

    radius : null,

    dist : null,

    rotSpeed : null,

    segments : 16,

    segmentsOrbit : 50,

    rings : 16,

    angle : 0,


    // ==== functions ====
    init : function(radius,image,dist,roundTime,revolutionSpeed){

        this.radius = radius;
        this.dist = dist;
        this.rotSpeed = 1/roundTime;
        this.revolutionSpeed = 0.1/revolutionSpeed;

        // create the sphere's material
        if(image){
            var texture = THREE.ImageUtils.loadTexture(this.IMAGE_PATH + image);
            var material = new THREE.MeshBasicMaterial( { map: texture } );
        }
        else{
            var material = new THREE.MeshLambertMaterial(
                {
                    color: 0xE8251E
                });
        }

        this.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(this.radius, this.segments, this.rings),
            material);

        this.mesh.position.x = this.dist;
        this.mesh.position.y = 0;
        this.mesh.position.z = 0;

        this.mesh.on('click', function(){
            alert('yes');
        });


    },

    getData : function(){

        return {mesh : this.mesh};

    },

    getOrbit : function(){
        // Create an empty geometry object to hold the line vertex data
        var geometry = new THREE.Geometry();

        // Create points along the circumference of a circle with radius == distance
        var i, len = 60, twopi = 2 * Math.PI;
        for (i = 0; i <= this.segmentsOrbit; i++)
        {
            var x = this.dist * Math.cos( i / this.segmentsOrbit * twopi );
            var z = this.dist * Math.sin( i / this.segmentsOrbit * twopi );
            var vertex = new THREE.Vector3(x, 0, z);
            geometry.vertices.push(vertex);
        }

        material = new THREE.LineBasicMaterial( { color: 0xffffff, opacity: .5, linewidth: 2 } );

        // Create the line
        return new THREE.Line( geometry, material );
    },

    update : function(){

        if(this.rotSpeed){
            this.angle += this.rotSpeed;

            this.mesh.position.z = Math.cos((this.angle * Math.PI)/180)*this.dist;
            this.mesh.position.x = Math.sin((this.angle * Math.PI)/180)*this.dist;
        }

        if(this.revolutionSpeed){
            this.mesh.rotation.y += this.revolutionSpeed;
        }

    }


});