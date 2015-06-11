(function () {
    "use strict";

    var data2000 = [];

    var width = 1200,
        height = 700;


    // To scale and translate map
    var projection = d3.geo.mercator()
        .scale(600)
        .translate([width/3, height/2 +600])
        .precision(0.1);

    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var path = d3.geo.path().projection(projection);

    var eu = [
        40, // Austria
        56, // Belgium
        100, // Bulgaria
        191, // Croatia
        196, // Cyprus
        203, // Czech Republic
        208, // Denmark
        233, // Estonia
        246, // Finland
        250, // France
        276, // Germany
        300, // Greece
        348, // Hungary
        372, // Ireland
        380, // Italy
        428, // Latvia
        440, // Lithuania
        442, // Luxembourg
        470, // Malta
        528, // Netherlands
        616, // Poland
        620, // Portugal
        642, // Romania
        703, // Slovakia
        705, // Slovenia
        724, // Spain
        752, // Sweden
        826 // United Kingdom
    ];

    // var countryToCode = {
    //         "Austria" : "40", // Austria
    //         "Belgium" : "56", // Belgium
    //         "Bulgaria" : "100", // Bulgaria
    //         "Croatia" : "191", // Croatia
    //         "Cyprus" : "196", // Cyprus
    //         "Czech Republic" : "203", // Czech Republic
    //         "Denmark" : "208", // Denmark
    //         "Estonia" : "233", // Estonia
    //         "Finland" : "246", // Finland
    //         "France" : "250", // France
    //         "Germany" : "276", // Germany
    //         "Greece" : "300", // Greece
    //         "Hungary" : "348", // Hungary
    //         "Ireland" : "372", // Ireland
    //         "Italy" : "380", // Italy
    //         "Latvia" : "428", // Latvia
    //         "Lithuania" : "440", // Lithuania
    //         "Luxembourg" : "442", // Luxembourg
    //         "Malta" : "470", // Malta
    //         "Netherlands" : "528", // Netherlands
    //         "Poland" : "616", // Poland
    //         "Portugal" : "620", // Portugal
    //         "Romania" : "642", // Romania
    //         "Slovakia" : "703", // Slovakia
    //         "Slovenia" : "705", // Slovenia
    //         "Spain" : "724", // Spain
    //         "Sweden" : "752", // Sweden
    //         "United Kingdom" : "826" // United Kingdom
    //     ];

    function isEuCountry(datum) {
        var code = parseInt(datum.properties.iso_n3, 10);
        return eu.indexOf(code) > -1;
    }

    d3.json("eu.json", function (error, europe) {
        if (error) return console.error(error);

        var svg = d3.select("#container").append("svg")
                                         .attr("width", width)
                                         .attr("height", height);

        var eu = topojson.feature(europe, europe.objects.europe),
            countries = eu.features;

        d3.csv("unemployment/Unemployment.csv", function(error, data) {

        for (var i = 0; i < data.length; i++) {
            if (data[i]['TIME'] === "2000") {
                data2000.push(data[i]);
            }
        }

        for (var i = 0; i < data2000.length; i++) {
            console.log('DATA 2000 ' + data2000[i]['GEO']);
            for (var j = 0; j < eu.length; j++) {
                console.log('iets');
                console.log('EU ' + eu['features'][j]['properties']['name']);
                if (eu['features'][j]['properties']['name'] === data2000[i]['GEO']) {
                    eu['features'][j]['unemploymentData'] = data2000[i];
                }
            }
        }

            // data.forEach(function(d) {
            //     console.log(d.GEO)
            // });


        });


        // var b = path.bounds(eu),
        //     s = 0.95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
        //     t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
        //     console.log(s)
        //     console.log(t)
        // projection.scale(1).translate(1,1);

        console.log(eu);

        svg.selectAll("path")
            .data(countries)
          .enter().append("path")
            .attr("d", path)
            .attr("class", "country")
            .classed("eu-country", isEuCountry)



        svg.selectAll(".eu-country")
            .on("mouseover", function (d) {
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div .html(d.properties.name)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
                })

             .on("mouseout", function(d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });
    });

})();