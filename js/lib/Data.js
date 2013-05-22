PS.lib.Data = Class.extend({
    // ==== variables ====

    CLASS_NAME: "PS.Data",

    planetTableData: null,

    planetObjectData: null,


    // ==== functions ====
    init: function () {
        this.importPlanetData();
        this.planetTableDataToObjectData();

    },

    getPlanetData: function () {


        return this.planetObjectData;
    },


    planetTableDataToObjectData: function () {

        var tableData = this.planetTableData;

        var objectData = {};

        for (var x in tableData) {
            if (tableData[x].Status == "Sonne" || tableData[x].Status == "Planet" || tableData[x].Status == "Zwergplanet") {
                if (!objectData[tableData[x].Name]) {
                    objectData[tableData[x].Name] = tableData[x];
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
    calculate_omega: function (data) {
        return parseFloat(data.w) - parseFloat(data.node);
    },
    calculate_TrueM: function (data) {

        //http://www.stjarnhimlen.se/comp/ppcomp.html#14
        //http://ssd.jpl.nasa.gov/?planet_pos

        var M = parseFloat(data.MJ2000)*(Math.PI / 180) - parseFloat(data.w)*(Math.PI / 180)  + parseFloat(data.e);

        M = M - Math.round(M/(2*Math.PI)) * 2*Math.PI;


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
    importPlanetData: function () {

        this.planetTableData = [
            {
                "Name": "Sonne",
                "Planet": "Sonne",
                "Status": "Sonne",
                "a": "",
                "e": "",
                "i": "",
                "node": "",
                "w": "",
                "MJ2000": "",
                "Periode": "",
                "Durchm1": "75000",
                "Durchm2": "",
                img: 'sun.jpg'
            },
            {
                "Name": "Mercury",
                "Planet": "Mercury",
                "Status": "Planet",
                "a": "57910",
                "e": "0.2056",
                "i": "7.0049",
                "node": "48.3317",
                "w": "77.4565",
                "MJ2000": "252.2508",
                "Periode": "87.969",
                "Durchm1": "9902",
                "Durchm2": "",
                img: 'mercury.jpg',
                AxialTilt: "0"
            },
            {
                "Name": "Venus",
                "Planet": "Venus",
                "Status": "Planet",
                "a": "108210",
                "e": "0.0068",
                "i": "3.3947",
                "node": "76.6807",
                "w": "131.533",
                "MJ2000": "181.9797",
                "Periode": "224.701",
                "Durchm1": "21366",
                "Durchm2": "",
                img: 'venus.jpg',
                AxialTilt: "177.36"
            },
            {
                "Name": "Earth",
                "Planet": "Earth",
                "Status": "Planet",
                "a": "149600",
                "e": "0.0167",
                "i": "0",
                "node": "-11.2606",
                "w": "102.9472",
                "MJ2000": "100.4644",
                "Periode": "365.256",
                "Revolution": "1",
                "Durchm1": "22601",
                "Durchm2": "",
                img: 'earth.jpg',
                AxialTilt: "23.4"
            },
            {
                "Name": "Mars",
                "Planet": "Mars",
                "Status": "Planet",
                "a": "227940",
                "e": "0.0934",
                "i": "1.8506",
                "node": "49.5785",
                "w": "336.0408",
                "MJ2000": "355.4533",
                "Periode": "686.98",
                "Durchm1": "14202",
                "Durchm2": "",
                img: 'mars.jpg',
                AxialTilt: "25.19"
            },
            {
                "Name": "Jupiter",
                "Planet": "Jupiter",
                "Status": "Planet",
                "a": "778423",
                "e": "0.0484",
                "i": "1.3053",
                "node": "100.5562",
                "w": "14.7539",
                "MJ2000": "34.4044",
                "Periode": "4331.936",
                "Durchm1": "171739",
                "Durchm2": "",
                img: 'jupiter.jpg',
                AxialTilt: "3.13"
            },
            {
                "Name": "Saturn",
                "Planet": "Saturn",
                "Status": "Planet",
                "a": "1426746",
                "e": "0.0542",
                "i": "2.4845",
                "node": "113.715",
                "w": "92.4319",
                "MJ2000": "49.9443",
                "Periode": "10759.346",
                "Durchm1": "151953",
                "Durchm2": "",
                img: 'saturn.jpg',
                AxialTilt: "26.73"
            },
            {
                "Name": "Uranus",
                "Planet": "Uranus",
                "Status": "Planet",
                "a": "2871013",
                "e": "0.0472",
                "i": "0.7699",
                "node": "74.2299",
                "w": "170.9642",
                "MJ2000": "313.2322",
                "Periode": "30685.522",
                "Durchm1": "94461",
                "Durchm2": "",
                img: 'uranus.jpg',
                AxialTilt: "97.77"
            },
            {
                "Name": "Neptune",
                "Planet": "Neptune",
                "Status": "Planet",
                "a": "4498317",
                "e": "0.0086",
                "i": "1.7692",
                "node": "131.7217",
                "w": "44.9714",
                "MJ2000": "304.88",
                "Periode": "60190.536",
                "Durchm1": "109512",
                "Durchm2": "",
                img: 'Neptune.jpg',
                AxialTilt: "28.32"
            },
            {
                "Name": "Ceres",
                "Planet": "Ceres",
                "Status": "Zwergplanet",
                "a": "413940",
                "e": "0.0791",
                "i": "10.5868",
                "node": "72.5898",
                "w": "80.3932",
                "MJ2000": "217.5023",
                "Periode": "1679.667",
                "Durchm1": "5395",
                "Durchm2": ""
            },
            {
                "Name": "Pluto",
                "Planet": "Pluto",
                "Status": "Zwergplanet",
                "a": "5906460",
                "e": "0.2488",
                "i": "17.1418",
                "node": "110.3035",
                "w": "224.0668",
                "MJ2000": "238.9288",
                "Periode": "90466.606",
                "Durchm1": "61377",
                "Durchm2": "",
                AxialTilt: "122.53"
            },
            {
                "Name": "Haumea",
                "Planet": "Haumea",
                "Status": "Zwergplanet",
                "a": "6483900",
                "e": "0.1952",
                "i": "28.194",
                "node": "121.819",
                "w": "240.6767",
                "MJ2000": "223.4198",
                "Periode": "103202.55",
                "Durchm1": "66039",
                "Durchm2": "1100"
            },
            {
                "Name": "Makemake",
                "Planet": "Makemake",
                "Status": "Zwergplanet",
                "a": "6830600",
                "e": "0.1599",
                "i": "29.013",
                "node": "79.287",
                "w": "297.0748",
                "MJ2000": "170.1272",
                "Periode": "112305.618",
                "Durchm1": "69373",
                "Durchm2": ""
            },
            {
                "Name": "Eris",
                "Planet": "Eris",
                "Status": "Zwergplanet",
                "a": "10173000",
                "e": "0.4371",
                "i": "43.8854",
                "node": "36.0309",
                "w": "150.8003",
                "MJ2000": "211.759",
                "Periode": "204624.523",
                "Durchm1": "104964",
                "Durchm2": ""
            },
            {
                "Name": "Moon",
                "Planet": "Earth",
                "Status": "Mond",
                "a": "17035",
                "e": "0.0554",
                "i": "5.16",
                "node": "125.08",
                "w": "318.15",
                "MJ2000": "135.27",
                "Periode": "27.322",
                "Durchm1": "6162",
                "Durchm2": ""
            },
            {
                "Name": "Io",
                "Planet": "Jupiter",
                "Status": "Mond",
                "a": "12936",
                "e": "0.0041",
                "i": "0.036",
                "node": "43.977",
                "w": "84.129",
                "MJ2000": "281.0041",
                "Periode": "1.77",
                "Durchm1": "4469",
                "Durchm2": ""
            },
            {
                "Name": "Europa",
                "Planet": "Jupiter",
                "Status": "Mond",
                "a": "20581",
                "e": "0.0094",
                "i": "0.466",
                "node": "219.106",
                "w": "88.97",
                "MJ2000": "89.8892",
                "Periode": "3.55",
                "Durchm1": "3830",
                "Durchm2": ""
            },
            {
                "Name": "Ganymed",
                "Planet": "Jupiter",
                "Status": "Mond",
                "a": "32827",
                "e": "0.0013",
                "i": "0.177",
                "node": "63.552",
                "w": "192.417",
                "MJ2000": "15.864",
                "Periode": "7.16",
                "Durchm1": "6455",
                "Durchm2": ""
            },
            {
                "Name": "Kallisto",
                "Planet": "Jupiter",
                "Status": "Mond",
                "a": "57738",
                "e": "0.0074",
                "i": "0.192",
                "node": "298.848",
                "w": "52.643",
                "MJ2000": "286.0215",
                "Periode": "16.69",
                "Durchm1": "5914",
                "Durchm2": ""
            },
            {
                "Name": "Mimas",
                "Planet": "Saturn",
                "Status": "Mond",
                "a": "6131",
                "e": "0.0196",
                "i": "1.574",
                "node": "173.027",
                "w": "332.499",
                "MJ2000": "14.848",
                "Periode": "0.94",
                "Durchm1": "525",
                "Durchm2": ""
            },
            {
                "Name": "Enceladus",
                "Planet": "Saturn",
                "Status": "Mond",
                "a": "7865",
                "e": "0",
                "i": "0.003",
                "node": "342.507",
                "w": "0.076",
                "MJ2000": "199.686",
                "Periode": "1.37",
                "Durchm1": "659",
                "Durchm2": ""
            },
            {
                "Name": "Tethys",
                "Planet": "Saturn",
                "Status": "Mond",
                "a": "9735",
                "e": "0.0001",
                "i": "1.091",
                "node": "259.842",
                "w": "45.202",
                "MJ2000": "243.367",
                "Periode": "1.89",
                "Durchm1": "1401",
                "Durchm2": ""
            },
            {
                "Name": "Dione",
                "Planet": "Saturn",
                "Status": "Mond",
                "a": "12467",
                "e": "0.0022",
                "i": "0.028",
                "node": "290.415",
                "w": "284.315",
                "MJ2000": "322.232",
                "Periode": "2.74",
                "Durchm1": "1477",
                "Durchm2": ""
            },
            {
                "Name": "Rhea",
                "Planet": "Saturn",
                "Status": "Mond",
                "a": "17412",
                "e": "0.0002",
                "i": "0.333",
                "node": "351.042",
                "w": "241.619",
                "MJ2000": "179.781",
                "Periode": "4.518",
                "Durchm1": "2019",
                "Durchm2": ""
            },
            {
                "Name": "Titan",
                "Planet": "Saturn",
                "Status": "Mond",
                "a": "40363",
                "e": "0.0288",
                "i": "0.306",
                "node": "28.06",
                "w": "180.532",
                "MJ2000": "163.31",
                "Periode": "15.95",
                "Durchm1": "6805",
                "Durchm2": ""
            },
            {
                "Name": "Hyperion",
                "Planet": "Saturn",
                "Status": "Mond",
                "a": "48364",
                "e": "0.0232",
                "i": "0.615",
                "node": "263.847",
                "w": "303.178",
                "MJ2000": "86.342",
                "Periode": "21.28",
                "Durchm1": "351",
                "Durchm2": ""
            },
            {
                "Name": "Iapetus",
                "Planet": "Saturn",
                "Status": "Mond",
                "a": "117625",
                "e": "0.0293",
                "i": "8.298",
                "node": "81.105",
                "w": "271.606",
                "MJ2000": "201.789",
                "Periode": "79.33",
                "Durchm1": "1897",
                "Durchm2": ""
            },
            {
                "Name": "Ariel",
                "Planet": "Uranus",
                "Status": "Mond",
                "a": "9022",
                "e": "0.0012",
                "i": "0.041",
                "node": "22.394",
                "w": "115.349",
                "MJ2000": "232.2723",
                "Periode": "2.52",
                "Durchm1": "2188",
                "Durchm2": ""
            },
            {
                "Name": "Umbriel",
                "Planet": "Uranus",
                "Status": "Mond",
                "a": "12578",
                "e": "0.0039",
                "i": "0.128",
                "node": "33.485",
                "w": "84.709",
                "MJ2000": "118.848",
                "Periode": "4.144",
                "Durchm1": "2209",
                "Durchm2": ""
            },
            {
                "Name": "Titania",
                "Planet": "Uranus",
                "Status": "Mond",
                "a": "20607",
                "e": "0.0011",
                "i": "0.079",
                "node": "99.771",
                "w": "284.4",
                "MJ2000": "353.6047",
                "Periode": "8.706",
                "Durchm1": "2981",
                "Durchm2": ""
            },
            {
                "Name": "Oberon",
                "Planet": "Uranus",
                "Status": "Mond",
                "a": "27560",
                "e": "0.0014",
                "i": "0.068",
                "node": "279.771",
                "w": "104.4",
                "MJ2000": "70.6262",
                "Periode": "13.463",
                "Durchm1": "2877",
                "Durchm2": ""
            },
            {
                "Name": "Miranda",
                "Planet": "Uranus",
                "Status": "Mond",
                "a": "6134",
                "e": "0.0013",
                "i": "4.338",
                "node": "326.438",
                "w": "68.312",
                "MJ2000": "303.18",
                "Periode": "1.414",
                "Durchm1": "892",
                "Durchm2": ""
            },
            {
                "Name": "Triton",
                "Planet": "Neptune",
                "Status": "Mond",
                "a": "19824",
                "e": "0",
                "i": "156.865",
                "node": "177.608",
                "w": "66.142",
                "MJ2000": "352.257",
                "Periode": "5.877",
                "Durchm1": "6050",
                "Durchm2": ""
            },
            {
                "Name": "Nereid",
                "Planet": "Neptune",
                "Status": "Mond",
                "a": "308051",
                "e": "0.7507",
                "i": "7.09",
                "node": "335.57",
                "w": "281.117",
                "MJ2000": "216.692",
                "Periode": "360.14",
                "Durchm1": "760",
                "Durchm2": ""
            },
            {
                "Name": "Proteus",
                "Planet": "Neptune",
                "Status": "Mond",
                "a": "6573",
                "e": "0.0005",
                "i": "0.075",
                "node": "315.131",
                "w": "67.968",
                "MJ2000": "250.938",
                "Periode": "1.122",
                "Durchm1": "939",
                "Durchm2": ""
            },
            {
                "Name": "Charon",
                "Planet": "Pluto",
                "Status": "Mond",
                "a": "12583",
                "e": "0.0022",
                "i": "0.001",
                "node": "85.187",
                "w": "71.255",
                "MJ2000": "147.848",
                "Periode": "6.387",
                "Durchm1": "30997",
                "Durchm2": ""
            },
            {
                "Name": "Hi'iaka",
                "Planet": "Haumea",
                "Status": "Mond",
                "a": "49909",
                "e": "0.0513",
                "i": "125.2",
                "node": "0",
                "w": "0",
                "MJ2000": "0",
                "Periode": "49.12",
                "Durchm1": "12407",
                "Durchm2": ""
            }
        ]

    }


});