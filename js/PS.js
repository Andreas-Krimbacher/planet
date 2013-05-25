//Autor: Andreas Krimbacher

// This closure creates the main object called PS
// Initialize the system with the PS.initialize();

(function($) {

    var universe = null;
    var speed = 0;
    var oldSpeed = 2;
    var oldDateString = "21/12/2012";


    //Function to detect WebGL browser support
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

    //initialize function
    var initialize = function() {

        if(!webgl_detect()){
            $('#noWebGl').show();
            return;
        }

        universe = new PS.lib.Universe('webglCanvas');

        // get data
        var planetData = new PS.lib.Data().getPlanetData();
        var planets = [];

        for(var x in planetData){
            planets[x] = new  PS.lib.Planet(planetData[x]);
            universe.addPlanet(planets[x]);
        }

        universe.hideDwarf();

        //add stars and light
        universe.addStars(new PS.lib.Stars(35000000).getStars());
        universe.addLight();

        // helper functions for production
        universe.showAxis('x');
//        universe.showAxis('y');
//        universe.showAxis('z');
//        universe.showAxis('-x');
//        universe.showAxis('-y');
//        universe.showAxis('-z');
//        universe.showPlane();
        //show camara coordinates on keypress 1
//        $(window).keydown(function(event){
//            if(event.keyCode == 49){
//                universe.alertCameraPosition();
//            }
//        });

        //start animation cycle
        universe.run();
    };


    // show the initial view
    var showAll = function(){
        if(universe.orbitVisible) universe.showOrbits();
        universe.resetCamera();
    };

    // show a planet
    // Parameter: name of the planet
    var showPlanet = function(planet){
        universe.adjustVisibility(planet);
        universe.clearOrbits();
        universe.showPlanetOrbit(planet,true);
        universe.setCameraToPlanet(planet);
    };

    // show a moon
    // Parameter:   name of the planet
    //              name of the moon
    var showMoon = function(planet,moon){
        if(PS.setLayerCheckbox) PS.setLayerCheckbox('moon',true);
        universe.showMoons();
        universe.clearOrbits();
        universe.showMoonOrbit(planet,moon);
        universe.setCameraToPlanet(planet);
    };

    //show a constellation
    //Parameter:    date
    //              camera postion
    var showConstellation = function(year,month,day,x,y,z){
        universe.stopPlanetMove();
        if(universe.orbitVisible) universe.showOrbits();
        universe.resetCamera(x,y,z);
        universe.setDate(new Date(year,parseFloat(month)-1,day));
    };

    //function to start navigate with the buttons
    //Parameter: direction - up,down,left,right,plus,minus
    //              continous - if true, move will stop on stopMoveCamera()
    var cameraMoveInterval;
    var startMoveCamera = function(direction,continous){
        if(continous) cameraMoveInterval = setInterval(function(){universe.moveCamera(direction)}, 100);
        else universe.moveCamera(direction);
    };

    //function to stop navigate with the buttons
    var stopMoveCamera = function(){
        clearInterval(cameraMoveInterval);
    };

    // toogle visibility of moons
    var toogleMoonVisibility = function(){
        if(!universe.moonVisible) universe.showMoons();
        else universe.hideMoons();
    };

    // toogle visibility of dwarf planets
    var toogleDwarfVisibility = function(){
        if(!universe.dwarfPlanetsVisible) universe.showDwarf();
        else universe.hideDwarf();
    };

    // toogle visibility of orbits
    var toogleOrbitVisibility = function(){
        if(!universe.orbitVisible) universe.showOrbits();
        else universe.hideOrbits();
    };

    // toogle planet rotation
    var tooglePlanetRotation = function(){
        if(!universe.animateRotation) universe.startPlanetRotation();
        else universe.stopPlanetRotation();
    };

    // set the universe to a specific year
    // slider is not updated
    var setDateFromSlider = function(years){
        stop();

        var baseTime = new Date(2000,0,1);
        var time = new Date();
        time.setTime(baseTime.getTime() + years*(24*60*60*1000*365));

        universe.setDate(time,true);
        $('#sliderTime').html(time.getDate() + '/' + (time.getMonth()+1) + '/' + time.getFullYear());
    };

    // update time slider
    // Parameter: date object
    var updateTimeSlider = function(time){
        PS.slider.setValue(time.getFullYear()-2000,false);
        $('#sliderTime').html(time.getDate() + '/' + (time.getMonth()+1) + '/' + time.getFullYear());
    };

    // set universe speed and update label
    // Parameter: speed - -3,-2,-1,0,1,2,3 - from backward to forward, 0 is stop
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

    //start planet move
    var start = function(){
        speed = oldSpeed;
        setUniverseSpeed(speed);
    };

    //stop planet move
    var stop = function(){
        if(speed == 0) return;
        oldSpeed = speed;
        speed = 0;
        setUniverseSpeed(speed);
    };

    //go one speed step forward
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

    //go one speed step backward
    var backward = function(){
        if(speed == 0){
            speed = -1;
        }
        else{
            speed--;
            if(speed == 0) speed--;
            if(speed < -3) speed = -3;
        }
        setUniverseSpeed(speed);
    };

    //open an input and set the entered date
    var openDateInput = function(){
        var dateString=prompt("Please enter a date. e.g 21/12/2012",oldDateString);
        if (dateString!=null && dateString!="")
        {

            var dateValues = dateString.split('/');

            if(dateValues.length != 3){
                dateValues = dateString.split('.');
                if(dateValues.length != 3){
                    alert("The input is invalid.");
                    return
                }
            }

            dateValues[0] = parseInt(dateValues[0]);
            if(!dateValues[0] || dateValues[0] < 1 || dateValues[0] > 31){
                alert("The input is invalid.");
                return
            }

            dateValues[1] = parseInt(dateValues[1]);
            if(!dateValues[1] || dateValues[1] < 1 || dateValues[1] > 12){
                alert("The input is invalid.");
                return
            }

            dateValues[2] = parseInt(dateValues[2]);
            if(!dateValues[2] || dateValues[1] < -50000 || dateValues[1] > 50000){
                alert("The input is invalid.");
                return
            }

            universe.stopPlanetMove();
            if(universe.orbitVisible) universe.showOrbits();
            universe.setDate(new Date(dateValues[2], dateValues[1]-1,dateValues[0]));

            oldDateString = dateString;
        }
    };

    //make the functions available over the PS object
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
        updateTimeSlider : updateTimeSlider,
        openDateInput :  openDateInput
    };
})($);
