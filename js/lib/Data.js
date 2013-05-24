//Autor: Andreas Krimbacher

// This object imports the data table from PS.planetData
// maps the data to planet objects
// calculates the argument of the perihelion and the true anomaly

PS.lib.Data = Class.extend({
    // ==== variables ====

    CLASS_NAME: "PS.Data",

    planetTableData: null,

    planetObjectData: null,


    // initialize
    init: function () {
        this.importPlanetData();
        this.planetTableDataToObjectData();

    },

    // returns the planet data object
    getPlanetData: function () {
        return this.planetObjectData;
    },

    //map the data table to the planet data object
    planetTableDataToObjectData: function () {

        var tableData = this.planetTableData;

        var objectData = {};

        var addToSun = 0;

        for (var x in tableData) {
            if (tableData[x].Status == "Sonne" || tableData[x].Status == "Planet" || tableData[x].Status == "Zwergplanet") {
                if (!objectData[tableData[x].Name]) {
                    objectData[tableData[x].Name] = tableData[x];

                    if(tableData[x].Status == "Sonne") objectData[tableData[x].Name].Durchm1 = parseFloat(objectData[tableData[x].Name].Durchm1) + addToSun;
                    else objectData[tableData[x].Name].a = parseFloat(objectData[tableData[x].Name].a) + addToSun;

                    objectData[tableData[x].Name].MJ2000_True = this.calculate_TrueM(objectData[tableData[x].Name]);
                    objectData[tableData[x].Name].omega = this.calculate_omega(objectData[tableData[x].Name]);
                }
                else {
                    alert("duplicate planet");
                }
            }
            else if (tableData[x].Status == "Mond") {
                if (objectData[tableData[x].Planet]) {
                    tableData[x].img = 'moon.jpg';
                    if (!objectData[tableData[x].Planet].moon) objectData[tableData[x].Planet].moon = {};
                    objectData[tableData[x].Planet].moon[tableData[x].Name] = tableData[x];
                    objectData[tableData[x].Planet].moon[tableData[x].Name].MJ2000_True = this.calculate_TrueM(objectData[tableData[x].Planet].moon[tableData[x].Name]);
                    objectData[tableData[x].Planet].moon[tableData[x].Name].omega = this.calculate_omega(objectData[tableData[x].Planet].moon[tableData[x].Name]);
                }
                else {
                    alert("no planet for the moon");
                }
            }
        }
        this.planetObjectData = objectData;


    },
    //calculate the argument of the perihelion
    calculate_omega: function (data) {
        return parseFloat(data.w) - parseFloat(data.node);
    },
    //calculate the true anomaly
    calculate_TrueM: function (data) {

        //http://www.stjarnhimlen.se/comp/ppcomp.html#14
        //http://ssd.jpl.nasa.gov/?planet_pos

        var M = parseFloat(data.MJ2000)*(Math.PI / 180) - parseFloat(data.w)*(Math.PI / 180);

        var E = M;
        var E_new = E;

        do{
            E = E_new;
            E_new = M + parseFloat(data.e) * Math.sin(E);
        } while(Math.abs(E-E_new) > 0.000001);

        var xv = Math.cos(E_new) - parseFloat(data.e);
        var yv = Math.sqrt(1 -  parseFloat(data.e)* parseFloat(data.e)) * Math.sin(E_new);

        var true_M =  Math.atan2(yv,xv);

        return true_M * (180 / Math.PI);
    },
    //get the data table
    importPlanetData: function () {

        this.planetTableData = PS.planetData;
    }
});
