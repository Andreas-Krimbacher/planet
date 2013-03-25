(function($) {
    // ==== private variables ====
    //http://www.asterank.com/3d/
    //http://jeromeetienne.github.com/threex/examples/threex.domevent/

    // ==== private functions ====


    // ==== public functions ====
    var initialize = function() {

        var universe = new PS.lib.Universe('webglCanvas');

        var planetData = new PS.lib.Data().getPlanetData();

        var planets = [];

        for(var x in planetData){
            planets.push(new  PS.lib.Planet(planetData[x]));
            universe.addPlanet(planets[planets.length-1]);
            universe.addObject(planets[planets.length-1].getOrbit());
        }

        universe.addStars(new PS.lib.Stars(4498252900/1000000).getStars());

        universe.addLight();
        universe.showAxis('x');
        universe.showAxis('y');
        universe.renderScene();
        universe.run();
    };



        //==== Return ====
    window.PS = {
        // ==== public variables ====
        VERSION_NUMBER: "0.1.0",
        lib : {},

        // ==== reveal public functions ====
        initialize : initialize
    };
})($);
