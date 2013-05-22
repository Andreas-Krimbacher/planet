(function($) {
    // ==== private variables ====
    //http://www.asterank.com/3d/
    //http://jeromeetienne.github.com/threex/examples/threex.domevent/

    var universe = null;

    // ==== private functions ====

    //http://www.browserleaks.com/webgl#howto-detect-webgl
    var webgl_detect = function(return_context)
    {
        if (!!window.WebGLRenderingContext) {
            var canvas = document.createElement("canvas"),
                names = ["webgl", "experimental-webgl", "moz-webgl", "webkit-3d"],
                context = false;

            for(var i=0;i<4;i++) {
                try {
                    context = canvas.getContext(names[i]);
                    if (context && typeof context.getParameter == "function") {
                        // WebGL is enabled
                        if (return_context) {
                            // return WebGL object if the function's argument is present
                            return {name:names[i], gl:context};
                        }
                        // else, return just true
                        return true;
                    }
                } catch(e) {}
            }

            // WebGL is supported, but disabled
            return false;
        }

        // WebGL not supported
        return false;
    };

    // ==== public functions ====
    var initialize = function() {

        if(!webgl_detect()){
            $('#noWebGl').show();
            return;
        }

        universe = new PS.lib.Universe('webglCanvas');

        var planetData = new PS.lib.Data().getPlanetData();

        var planets = [];

        for(var x in planetData){
            planets[x] = new  PS.lib.Planet(planetData[x]);
            universe.addPlanet(planets[x]);
        }

        universe.hideDwarf();
        //universe.hideMoons();

        universe.addStars(new PS.lib.Stars(35000000).getStars());

        universe.addLight();
//        universe.showAxis('x');
//       universe.showAxis('y');
//       universe.showAxis('z');
//        universe.showAxis('-x');
//        universe.showAxis('-y');
//        universe.showAxis('-z');
        //       universe.showPlane();

        $(window).keydown(function(event){
            if(event.keyCode == 49){
                universe.alertCameraPosition();
            }
        });


        universe.renderScene();
        universe.run();
        //universe.startPlanetMove();
    };



    var showAll = function(){
        if(universe.orbitVisible) universe.showOrbits();
        universe.resetCamera();
    };

    var showPlanet = function(planet){
        universe.adjustVisibility(planet);
        universe.clearOrbits();
        universe.showPlanetOrbit(planet,true);
        universe.setCameraToPlanet(planet);
    };

    var showMoon = function(planet,moon){
        if(PS.setLayerCheckbox) PS.setLayerCheckbox('moon',true);
        universe.showMoons();
        universe.clearOrbits();
        universe.showMoonOrbit(planet,moon);
        universe.setCameraToPlanet(planet);
    };

    var showConstellation = function(year,month,day,x,y,z){
        universe.stopPlanetMove();
        if(universe.orbitVisible) universe.showOrbits();
        universe.resetCamera(x,y,z);
        universe.setDate(new Date(year,parseFloat(month)-1,day));
    };

    var cameraMoveInterval;
    var startMoveCamera = function(direction,continous){
        if(continous) cameraMoveInterval = setInterval(function(){universe.moveCamera(direction)}, 100);
        else universe.moveCamera(direction);
    };

    var stopMoveCamera = function(){
        clearInterval(cameraMoveInterval);
    };


    var toogleMoonVisibility = function(){
        if(!universe.moonVisible) universe.showMoons();
        else universe.hideMoons();
    };

    var toogleDwarfVisibility = function(){
        if(!universe.dwarfPlanetsVisible) universe.showDwarf();
        else universe.hideDwarf();
    };

    var toogleOrbitVisibility = function(){
        if(!universe.orbitVisible) universe.showOrbits();
        else universe.hideOrbits();
    };

    var tooglePlanetRotation = function(){
        if(!universe.animateRotation) universe.startPlanetRotation();
        else universe.stopPlanetRotation();
    };


    var setDateFromSlider = function(years){
        stop();

        var baseTime = new Date(2000,0,1);

        var time = new Date();
        time.setTime(baseTime.getTime() + years*(24*60*60*1000*365));
        universe.setDate(time,true);
        $('#sliderTime').html(time.getDate() + '/' + (time.getMonth()+1) + '/' + time.getFullYear());
    };

    var updateTimeSlider = function(time){
        PS.slider.setValue(time.getFullYear()-2000,false);
        $('#sliderTime').html(time.getDate() + '/' + (time.getMonth()+1) + '/' + time.getFullYear());
    };


    var speed = 0;
    var oldSpeed = 2;

    var setUniverseSpeed =  function(speed){
        if(speed == 0) universe.stopPlanetMove();
        else if(speed > 0) universe.forward(speed);
        else universe.backward(-speed);

        switch(speed){
            case -3:
                $('#forwardLabel').hide();
                $('#backwardLabel').html('2x');
                $('#backwardLabel').show();
                break;
            case -2:
                $('#forwardLabel').hide();
                $('#backwardLabel').html('1x');
                $('#backwardLabel').show();
                break;
            case -1:
                $('#forwardLabel').hide();
                $('#backwardLabel').html('0.5x');
                $('#backwardLabel').show();
                break;
            case 0:
                $('#backwardLabel').hide();
                $('#forwardLabel').hide();
                break;
            case 1:
                $('#backwardLabel').hide();
                $('#forwardLabel').html('0.5x');
                $('#forwardLabel').show();
                break;
            case 2:
                $('#backwardLabel').hide();
                $('#forwardLabel').html('1x');
                $('#forwardLabel').show();
                break;
            case 3:
                $('#backwardLabel').hide();
                $('#forwardLabel').html('2x');
                $('#forwardLabel').show();
                break;
            default:
                $('#backwardLabel').hide();
                $('#forwardLabel').hide();
                break;
        }

    };

    var start = function(){
        speed = oldSpeed;
        setUniverseSpeed(speed);
    };

    var stop = function(){
        if(speed == 0) return;
        oldSpeed = speed;
        speed = 0;
        setUniverseSpeed(speed);
    };

    var forward = function(){
        if(speed == 0){
            speed = 2;
        }
        else{
            speed++;
            if(speed == 0) speed++;
            if(speed > 3) speed = 3;
        }
        setUniverseSpeed(speed);
    };

    var backward = function(){
        if(speed == 0){
            speed = -2;
        }
        else{
            speed--;
            if(speed == 0) speed--;
            if(speed < -3) speed = -3;
        }

        setUniverseSpeed(speed);
    };



    //==== Return ====
    window.PS = {
        // ==== public variables ====
        VERSION_NUMBER: "0.1.0",
        lib : {},

        // ==== reveal public functions ====
        initialize : initialize,
        showPlanet : showPlanet,
        showMoon : showMoon,
        showAll : showAll,
        showConstellation : showConstellation,
        startMoveCamera : startMoveCamera,
        stopMoveCamera : stopMoveCamera,
        start : start,
        stop : stop,
        toogleMoonVisibility : toogleMoonVisibility,
        toogleDwarfVisibility : toogleDwarfVisibility,
        toogleOrbitVisibility: toogleOrbitVisibility,
        tooglePlanetRotation: tooglePlanetRotation,
        forward : forward,
        backward : backward,
        setDateFromSlider : setDateFromSlider,
        updateTimeSlider : updateTimeSlider
    };
})($);
