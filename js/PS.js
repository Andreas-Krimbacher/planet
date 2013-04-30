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

        universe.addStars(new PS.lib.Stars(15000).getStars());

        universe.addLight();
//        universe.showAxis('x');
//        universe.showAxis('y');
//        universe.showAxis('z');
//        universe.showAxis('-x');
//        universe.showAxis('-y');
//        universe.showAxis('-z');
        universe.showPlane();

        $(window).keydown(function(event){
            if(event.keyCode == 49){
                universe.showOrbits();
                universe.resetCamera();
            }
            if(event.keyCode == 50){
                universe.hideOrbits();
            }

            if(event.keyCode == 51){
                universe.setCameraToPlanet('Venus');
            }
            if(event.keyCode == 52){
                universe.hideOrbits();
                universe.showPlanetOrbit('Erde',true);
                universe.setCameraToPlanet('Erde');
            }
            if(event.keyCode == 53){
                universe.setCameraToPlanet('Mars');
            }
            if(event.keyCode == 54){
                universe.setCameraToPlanet('Jupiter');
            }
            if(event.keyCode == 55){
                universe.setCameraToPlanet('Saturn');
            }
            if(event.keyCode == 56){
                universe.setCameraToPlanet('Uranus');
            }
            if(event.keyCode == 57){
                universe.setDate(new Date(2004,5,8));
            }
            if(event.keyCode == 48){
                universe.stopPlanetMove();
            }
            if(event.keyCode == 63){
                universe.startPlanetMove();
            }
        });


        universe.renderScene();
        universe.run();
    };

    var showAll = function(){
        universe.showOrbits();
        universe.resetCamera();
    };

    var showPlanet = function(planet){
        universe.hideOrbits();
        universe.showPlanetOrbit(planet,true);
        universe.setCameraToPlanet(planet);
    };

    var showMoon = function(planet,moon){
        universe.hideOrbits();
        universe.showMoonOrbit(planet,moon);
        universe.setCameraToPlanet(planet);
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
        showAll : showAll
    };
})($);
