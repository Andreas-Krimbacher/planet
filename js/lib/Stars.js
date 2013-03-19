PS.lib.Stars = Class.extend({
    // ==== variables ====

    CLASS_NAME: "PS.Stars",

    stars : null,



    // ==== functions ====
    init : function(minDistance){


        var materials = this.createMaterials(11);
        var geometries =  this.createParticles(600,minDistance);
        this.stars = this.createParticleSystems(geometries,materials);

    },

    createParticles : function(number,minDistance){

        var starsGeometry = new THREE.Geometry();

        // Create random particle locations
        for ( i = 0; i < number; i++)
        {

            var vector = new THREE.Vector3( (Math.random() * 2 - 1) * minDistance,
                (Math.random() * 2 - 1) * minDistance,
                (Math.random() * 2 - 1) * minDistance);

            if (vector.length() <  minDistance)
            {
                vector = vector.setLength(minDistance);
            }

            starsGeometry.vertices.push( vector );

        }

        return starsGeometry;

    },

    createMaterials : function(number){

        // Create a range of sizes and colors for the stars
        var starsMaterials = [];
        for (i = 0; i < number; i++)
        {
            starsMaterials.push(
                new THREE.ParticleBasicMaterial( { color: 0x101010 * (i + 1),
                    size: i % 2 + 1,
                    sizeAttenuation: false } )
            );
        }

        return starsMaterials;

    },

    createParticleSystems : function(geometries,materials){

        // Create several particle systems spread around in a circle, cover the sky

        var starsGroup = new THREE.Object3D();

        for ( i = 0; i < materials.length - 1; i ++ )
        {

            var stars = new THREE.ParticleSystem( geometries, materials[ i ] );

            stars.rotation.y = i / (Math.PI * 2);

            starsGroup.add( stars );

        }

        return starsGroup;

    },

    getStars : function(){

        return this.stars;

    }


});