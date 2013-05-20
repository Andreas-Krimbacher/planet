(function($) {
    // ==== private variables ====
    //http://www.asterank.com/3d/
    //http://jeromeetienne.github.com/threex/examples/threex.domevent/

    var universe = null;

    // ==== private functions ====


    // ==== public functions ====
    var initialize = function() {

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
//        universe.showAxis('y');
//        universe.showAxis('z');
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
        universe.clearOrbits();
        universe.showPlanetOrbit(planet,true);
        universe.setCameraToPlanet(planet);
    };

    var showMoon = function(planet,moon){
        universe.clearOrbits();
        universe.showMoonOrbit(planet,moon);
        universe.setCameraToPlanet(planet);
    };

    var showConstellation = function(year,month,day){
          universe.stopPlanetMove();
        universe.resetCamera();
        universe.setDate(new Date(year,parseFloat(month)-1,day));
    };

    var moveCamera = function(direction){
        universe.moveCamera(direction);
    };

    var start = function(){
        universe.startPlanetMove();
    };

    var stop = function(){
        speedForward = 0;
        speedBackward = 0;
        universe.stopPlanetMove();
    };

    var setMoonVisibility = function(state){
        if(state) universe.showMoons();
        else universe.hideMoons();
    };

    var setDwarfVisibility = function(state){
        if(state) universe.showDwarf();
        else universe.hideDwarf();
    };

    var setOrbitVisibility = function(state){
        if(state) universe.showOrbits();
        else universe.hideOrbits();
    };


    var setDateFromSlider = function(years){
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


    var speedForward = 0;
    var speedBackward = 0;

    var forward = function(){
        speedForward++;
        if(speedForward > 3) speedForward = 3;
        speedBackward = 0;
        universe.forward(speedForward);
    };

    var backward = function(){
        speedBackward++;
        if(speedBackward > 3) speedBackward = 3;
        speedForward = 0;
        universe.backward(speedBackward);
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
        moveCamera : moveCamera,
        start : start,
        stop : stop,
        setMoonVisibility : setMoonVisibility,
        setDwarfVisibility : setDwarfVisibility,
        setOrbitVisibility: setOrbitVisibility,
        forward : forward,
        backward : backward,
        setDateFromSlider : setDateFromSlider,
        updateTimeSlider : updateTimeSlider
    };
})($);
