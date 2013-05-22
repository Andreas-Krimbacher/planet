PS.lib.Planet = Class.extend({
// ==== variables ====
    CLASS_NAME: "PS.Planet",
    IMAGE_PATH : 'img/',
    planetDataObject : null,
    planetMesh : null,
    rotAxisLine : null,
    objectGroup : null,
    objectGroupPlanet : null,
    objectGroupMoon : null,
    orbit : null,
    orbitMoon : null,
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
    rotAxisMoon : null,
    rotAxis : null,
    segments : 32,
    segmentsOrbit : 120,
    rings : 32,
    angle : 0,
    camera : null,
    distScale : null,
    radiusScale : null,
    periodScale : null,
    distScaleMoon : null,
    radiusScaleMoon : null,
    periodScaleMoon : null,

    daysSpeed1:0.005,
    daysSpeed2:1.1,
    daysSpeed3:100,

// ==== functions ====
    init : function(planetDataObject){

        this.distScale = {type: "linear", value : 1};
        this.radiusScale = {type: "linear", value : 1};
        this.periodScale = {type: "linear", value : 1};
        this.distScaleMoon = {type: "linear", value : 1};
        this.radiusScaleMoon = {type: "linear", value : 1};
        this.periodScaleMoon = {type: "linear", value : 0.1};
        this.planetDataObject = planetDataObject;

        this._createPlanet();
    },
    _createPlanet : function(){

//        this.planetDataObject.node = 0;
//        this.planetDataObject.i = 0;
//        this.planetDataObject.omega = 0;
//        this.planetDataObject.MJ2000_True = 0;
//        this.planetDataObject.e = 0;
//

        var planetDataObject = this.planetDataObject;

        this.objectGroup = new THREE.Object3D();


        this.objectGroupPlanet = new THREE.Object3D();
        this.objectGroupPlanet.position.x = this.scaleDist(planetDataObject.a);
        this.objectGroup.add(this.objectGroupPlanet);

        var objectGroupTilt = new THREE.Object3D();
        if(this.planetDataObject.AxialTilt) objectGroupTilt.rotation.z = this.planetDataObject.AxialTilt * Math.PI/180;
        this.objectGroupPlanet.add(objectGroupTilt);


        if(this.planetDataObject.Status != 'Sonne'){
            //rotations axis
            var geometry = new THREE.Geometry();
            geometry.vertices.push(new THREE.Vector3(0, -this.scaleRadius(planetDataObject.Durchm1/2)*1.2, 0));
            geometry.vertices.push(new THREE.Vector3(0, this.scaleRadius(planetDataObject.Durchm1/2)*1.2, 0));
            var material = new THREE.LineBasicMaterial({
                color: 0x677798
            });
            this.rotAxisLine = new THREE.Line( geometry, material );
            objectGroupTilt.add(this.rotAxisLine);
        }

        if(planetDataObject.moon){
            this.objectGroupMoon = {};
            this.orbitMoon = {};
            this.rotWorldMatrixMoonForwardSpeed1 = {};
            this.rotWorldMatrixMoonBackwardSpeed1 = {};
            this.rotWorldMatrixMoonForwardSpeed2 = {};
            this.rotWorldMatrixMoonBackwardSpeed2 = {};
            this.rotWorldMatrixMoonForwardSpeed3 = {};
            this.rotWorldMatrixMoonBackwardSpeed3 = {};
            this.rotAxisMoon = {};
            var moon,meshMoon;


            for(var x in planetDataObject.moon){

                this.orbitMoon[planetDataObject.moon[x].Name] = this._createOrbit(this.scaleDistMoon(planetDataObject.moon[x].a)+this.scaleRadius(planetDataObject.Durchm1/2));
                objectGroupTilt.add(this.orbitMoon[planetDataObject.moon[x].Name]);


                moon = new THREE.Object3D();
                // create the sphere's material
                if(planetDataObject.moon[x].img){
                    var texture = THREE.ImageUtils.loadTexture(this.IMAGE_PATH + planetDataObject.moon[x].img);
                    var material = new THREE.MeshPhongMaterial( {map: texture, ambient: 0x333333} );
                }
                else{
                    var material = new THREE.MeshPhongMaterial( { color: 0x999999, ambient: 0x333333} );
                }

                meshMoon = new THREE.Mesh(
                    new THREE.SphereGeometry(this.scaleRadiusMoon(planetDataObject.moon[x].Durchm1/2), this.segments, this.rings),
                    material);
                meshMoon.position.x = this.scaleDistMoon(parseFloat(planetDataObject.moon[x].a))+this.scaleRadius(planetDataObject.Durchm1/2);
                moon.add(meshMoon);

                this.objectGroupMoon[planetDataObject.moon[x].Name] = moon;
                objectGroupTilt.add(moon);

//                this.planetDataObject.moon[x].node = 90;
//                this.planetDataObject.moon[x].i = 45;
//                this.planetDataObject.moon[x].omega = 0;
//                this.planetDataObject.moon[x].MJ2000_True = 0;
//                this.planetDataObject.moon[x].e = 0;

                this._alignOrbit( moon , planetDataObject.moon[x],this.orbitMoon[planetDataObject.moon[x].Name],this.scaleDist(planetDataObject.a));
            }
        }


        // create the sphere's material

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




        this.planetMesh = new THREE.Mesh(
            new THREE.SphereGeometry(this.scaleRadius(planetDataObject.Durchm1/2), this.segments, this.rings),
            material);

        objectGroupTilt.add(this.planetMesh);


        if(this.planetDataObject.Status != 'Sonne'){
            this.orbit = this._createOrbit(this.scaleDist(planetDataObject.a));
        }

        if(this.planetDataObject.Status != 'Sonne') this._alignOrbit( this.objectGroup ,this.planetDataObject, this.orbit);
    },
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
    _alignOrbit : function(object,options,orbit,moonTranslateX){
        // node
        var axis = new THREE.Vector3(0,1,0);
        var rotWorldMatrix = new THREE.Matrix4();
        rotWorldMatrix.makeRotationAxis(axis.normalize(), options.node*Math.PI/180);
        rotWorldMatrix.multiply(object.matrix); // pre-multiply
        object.matrix = rotWorldMatrix;
        object.rotation.setEulerFromRotationMatrix(object.matrix);


        // i
        var axis_x = Math.cos(options.node*Math.PI/180);
        var axis_y = 0;
        var axis_z = Math.sin(-options.node*Math.PI/180);
        axis = new THREE.Vector3(axis_x,axis_y,axis_z);
        rotWorldMatrix = new THREE.Matrix4();
        rotWorldMatrix.makeRotationAxis(axis.normalize(), options.i*Math.PI/180);
        rotWorldMatrix.multiply(object.matrix); // pre-multiply
        object.matrix = rotWorldMatrix;
        object.rotation.setEulerFromRotationMatrix(object.matrix);


        // i orbit
        if(orbit){
            rotWorldMatrix.multiply(orbit.matrix); // pre-multiply
            orbit.matrix = rotWorldMatrix;
            orbit.rotation.setEulerFromRotationMatrix(orbit.matrix);
        }


        //omega
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


        //MJ2000_True
        rotWorldMatrix = new THREE.Matrix4();
        rotWorldMatrix.makeRotationAxis(rotAxis, (parseFloat(options.MJ2000_True))*Math.PI/180);
        rotWorldMatrix.multiply(object.matrix); // pre-multiply
        object.matrix = rotWorldMatrix;
        object.rotation.setEulerFromRotationMatrix(object.matrix);


        //return rotationMatrix
        var rotWorldMatrixForwardSpeed1 = new THREE.Matrix4();
        var rotWorldMatrixBackwardSpeed1 = new THREE.Matrix4();
        var rotWorldMatrixForwardSpeed2 = new THREE.Matrix4();
        var rotWorldMatrixBackwardSpeed2 = new THREE.Matrix4();
        var rotWorldMatrixForwardSpeed3 = new THREE.Matrix4();
        var rotWorldMatrixBackwardSpeed3 = new THREE.Matrix4();
        if(moonTranslateX){
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
            this.rotAxisMoon[options.Name] = rotAxis;
        }
        else{
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
            this.rotAxis = rotAxis;
        }

    },
    scaleDist : function(dist){

        if(this.distScale.type == "linear") return dist/this.distScale.value;

    },
    scaleRadius : function(radius){

        if(this.radiusScale.type == "linear") return radius/this.radiusScale.value;

    },
    scaleDistMoon : function(dist){

        if(this.distScale.type == "linear") return dist/this.distScaleMoon.value;

    },
    scaleRadiusMoon : function(radius){

        if(this.radiusScale.type == "linear") return radius/this.radiusScaleMoon.value;

    },
    getObjectGroup : function(){

        return this.objectGroup;

    },
    getOrbit : function(){

        return this.orbit;

    },
    updateForward : function(speed,animateMoons,animateRotation){
        var rotWorldMatrix;
        if(this.rotWorldMatrixForwardSpeed1){


            if(speed == 2) rotWorldMatrix = this.rotWorldMatrixForwardSpeed2.clone();
            else if(speed == 3) rotWorldMatrix = this.rotWorldMatrixForwardSpeed3.clone();
            else rotWorldMatrix = this.rotWorldMatrixForwardSpeed1.clone();

            rotWorldMatrix.multiply(this.objectGroup.matrix); // pre-multiply
            this.objectGroup.matrix = rotWorldMatrix;
            this.objectGroup.rotation.setEulerFromRotationMatrix(this.objectGroup.matrix);

            if(speed == 2) rotWorldMatrix = this.rotWorldMatrixBackwardSpeed2.clone();
            else if(speed == 3) rotWorldMatrix = this.rotWorldMatrixBackwardSpeed3.clone();
            else rotWorldMatrix = this.rotWorldMatrixBackwardSpeed1.clone();

            rotWorldMatrix.multiply(this.objectGroupPlanet.matrix); // pre-multiply
            this.objectGroupPlanet.matrix = rotWorldMatrix;
            this.objectGroupPlanet.rotation.setEulerFromRotationMatrix(this.objectGroupPlanet.matrix);


            if(animateRotation && this.planetDataObject.Rotation){
                if(speed == 2) this.planetMesh.rotation.y += 2 * Math.PI * this.daysSpeed2 / this.planetDataObject.Rotation;
                else if(speed == 3) this.planetMesh.rotation.y += 2 * Math.PI * this.daysSpeed3 / this.planetDataObject.Rotation;
                else this.planetMesh.rotation.y += 2 * Math.PI * this.daysSpeed1 / this.planetDataObject.Rotation;
            }

        }

        if(animateMoons && this.rotWorldMatrixMoonForwardSpeed1){
            for(var x in this.rotWorldMatrixMoonForwardSpeed1){
                if(speed == 2) rotWorldMatrix = this.rotWorldMatrixMoonForwardSpeed2[x].clone();
                else if(speed == 3) rotWorldMatrix = this.rotWorldMatrixMoonForwardSpeed3[x].clone();
                else rotWorldMatrix = this.rotWorldMatrixMoonForwardSpeed1[x].clone();

                rotWorldMatrix.multiply(this.objectGroupMoon[x].matrix);
                this.objectGroupMoon[x].matrix = rotWorldMatrix;
                this.objectGroupMoon[x].rotation.setEulerFromRotationMatrix(this.objectGroupMoon[x].matrix);
            }
        }
    },
    updateBackward : function(speed,animateMoons,animateRotation){
        var rotWorldMatrix;
        if(this.rotWorldMatrixBackwardSpeed1){
            if(speed == 2) rotWorldMatrix = this.rotWorldMatrixBackwardSpeed2.clone();
            else if(speed == 3) rotWorldMatrix = this.rotWorldMatrixBackwardSpeed3.clone();
            else rotWorldMatrix = this.rotWorldMatrixBackwardSpeed1.clone();

            rotWorldMatrix.multiply(this.objectGroup.matrix); // pre-multiply
            this.objectGroup.matrix = rotWorldMatrix;
            this.objectGroup.rotation.setEulerFromRotationMatrix(this.objectGroup.matrix);

            if(speed == 2) rotWorldMatrix = this.rotWorldMatrixForwardSpeed2.clone();
            else if(speed == 3) rotWorldMatrix = this.rotWorldMatrixForwardSpeed3.clone();
            else rotWorldMatrix = this.rotWorldMatrixForwardSpeed1.clone();

            rotWorldMatrix.multiply(this.objectGroupPlanet.matrix); // pre-multiply
            this.objectGroupPlanet.matrix = rotWorldMatrix;
            this.objectGroupPlanet.rotation.setEulerFromRotationMatrix(this.objectGroupPlanet.matrix);


            if(animateRotation && this.planetDataObject.Rotation){
                if(speed == 2) this.planetMesh.rotation.y -= 2 * Math.PI * this.daysSpeed2 / this.planetDataObject.Rotation;
                else if(speed == 3) this.planetMesh.rotation.y -= 2 * Math.PI * this.daysSpeed3 / this.planetDataObject.Rotation;
                else this.planetMesh.rotation.y -= 2 * Math.PI * this.daysSpeed1 / this.planetDataObject.Rotation;
            }
        }

        if(animateMoons && this.rotWorldMatrixMoonBackwardSpeed1){
            for(var x in this.rotWorldMatrixMoonBackwardSpeed1){
                if(speed == 2) rotWorldMatrix = this.rotWorldMatrixMoonBackwardSpeed2[x].clone();
                else if(speed == 3) rotWorldMatrix = this.rotWorldMatrixMoonBackwardSpeed3[x].clone();
                else rotWorldMatrix = this.rotWorldMatrixMoonBackwardSpeed1[x].clone();

                rotWorldMatrix.multiply(this.objectGroupMoon[x].matrix);
                this.objectGroupMoon[x].matrix = rotWorldMatrix;
                this.objectGroupMoon[x].rotation.setEulerFromRotationMatrix(this.objectGroupMoon[x].matrix);
            }
        }
    },
    setCamera : function(camera){


        this.objectGroupPlanet.add(camera.camera);

        var vectorToCenter = new THREE.Vector3().getPositionFromMatrix(this.planetMesh.matrixWorld);
        vectorToCenter.setLength(vectorToCenter.length()+(this.scaleRadius(this.planetDataObject.Durchm1*3)));
        vectorToCenter.y += (this.scaleRadius(this.planetDataObject.Durchm1));

        camera.camera.position = this.objectGroupPlanet.worldToLocal(vectorToCenter);

        this.camera = camera;
    },
    removeCamera : function(){
        this.camera = null;
    },
    moveDays : function(days){
        var rotWorldMatrix = new THREE.Matrix4();
        rotWorldMatrix.makeRotationAxis(this.rotAxis, (days*2*Math.PI) / this.planetDataObject.Periode);
        rotWorldMatrix.multiply(this.objectGroup.matrix); // pre-multiply
        this.objectGroup.matrix = rotWorldMatrix;
        this.objectGroup.rotation.setEulerFromRotationMatrix(this.objectGroup.matrix);

        rotWorldMatrix = new THREE.Matrix4();
        rotWorldMatrix.makeRotationAxis(this.rotAxis, (-1) * (days*2*Math.PI) / this.planetDataObject.Periode);
        rotWorldMatrix.multiply(this.objectGroupPlanet.matrix); // pre-multiply
        this.objectGroupPlanet.matrix = rotWorldMatrix;
        this.objectGroupPlanet.rotation.setEulerFromRotationMatrix(this.objectGroupPlanet.matrix);

        for(var x in this.rotAxisMoon){
            rotWorldMatrix = new THREE.Matrix4();
            rotWorldMatrix.makeRotationAxis(this.rotAxisMoon[x], (days*2*Math.PI) / this.planetDataObject.moon[x].Periode);
            rotWorldMatrix.multiply(this.objectGroupMoon[x].matrix); // pre-multiply
            this.objectGroupMoon[x].matrix = rotWorldMatrix;
            this.objectGroupMoon[x].rotation.setEulerFromRotationMatrix(this.objectGroupMoon[x].matrix);
        }
    }
});
