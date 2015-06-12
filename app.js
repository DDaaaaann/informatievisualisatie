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

    function isEuCountry(datum) {
        var code = parseInt(datum.properties.iso_n3, 10);
        return eu.indexOf(code) > -1;
    }

    function getColor(value){
        console.log(value);
        //value from 0 to 1
        var hue=((1-value)*120).toString(10);
        return ["hsl(",hue,",100%,50%)"].join("");
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
                for (var j = 0; j < countries.length; j++) {
                    if (countries[j]['properties']['name'] === data2000[i]['GEO']) {
                        if (!countries[j].hasOwnProperty('unemploymentData')) {
                            countries[j].unemploymentData = [];
                        }

                        countries[j].unemploymentData.push(data2000[i]);
                    }
                }
            }

            svg.selectAll("path")
            .data(countries)
            .enter().append("path")
            .attr("d", path)
            .attr("class", "country")
            .style("fill", function(d) { console.log(d); if (d.hasOwnProperty('unemploymentData')) { console.log('has property'); return getColor(d['unemploymentData'][0]['Value']); } else { console.log('has no property'); return getColor(0); } })
            .classed("eu-country", isEuCountry);

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
    });

})();