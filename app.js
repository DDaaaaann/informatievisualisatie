(function () {
    "use strict";

    var svg;
    var line;
    var year = 2000;
    var width = 1000,
        height = 700;


    // To scale and translate map
    var projection = d3.geo.mercator()
        .scale(600)
        .translate([width/2 - 220, height/2 +600]);

    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var path = d3.geo.path().projection(projection);

    var x = d3.scale.linear()
        .domain([0, 12])
        .range([0, width]);

    var y = d3.scale.linear()
        .domain([-1, 16])
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .tickSize(-height)
        .tickPadding(10)
        .tickSubdivide(true)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .tickPadding(10)
        .tickSize(-width)
        .tickSubdivide(true)
        .orient("left");



    // http://blog.mondula.com/mapping-minimum-wages-europe#comment-21
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
        352, // Iceland
        380, // Italy
        428, // Latvia
        440, // Lithuania
        442, // Luxembourg
        470, // Malta
        528, // Netherlands
        578, // Norway
        616, // Poland
        620, // Portugal
        642, // Romania
        703, // Slovakia
        705, // Slovenia
        724, // Spain
        752, // Sweden
        792, // Turkey
        826 // United Kingdom
    ];

    function isEuCountry(datum) {
        var code = parseInt(datum.properties.iso_n3, 10);
        return eu.indexOf(code) > -1;
    }

    function getColor(value){

        //value from 0 to 1
        // var hue=((1-(4/value))*100).toString(10);
        var hue=((150*(value/30))+20).toString(10);
        // of > 0
        if(hue > -1) {
            return ["hsl(3,",hue,"%,",80-hue/3,"%)"].join("");
        } else {
            return "black";
        }
    }



    d3.json("eu.json", function (error, europe) {
        if (error) return console.error(error);

        var eu = topojson.feature(europe, europe.objects.europe),
            countries = eu.features;

        // console.log(countries)


            d3.csv("unemployment/Unemployment.csv", function(error, data) {
                eu = topojson.feature(europe, europe.objects.europe),
                        countries = eu.features;
                    for (var i = 0; i < data.length; i += 9) {
                        for (var j = 0; j < countries.length; j++) {
                            if (countries[j]['properties']['name'] === data[i]['GEO']) {

                                if (!countries[j].hasOwnProperty('unemploymentData')) {
                                    countries[j].unemploymentData = [];

                                }
                                countries[j].unemploymentData[data[i]['TIME']] = [9];
                                for (var k = i; k < i + 9; k++) {
                                    countries[j].unemploymentData[data[i]['TIME']][k - i] = data[k];

                                }
                            }
                        }

                    }
                updateMap(countries, year);

                function updateYear(nYear) {
                    // var unEmpData = data;
                    // adjust the text on the range slider
                    d3.select("#nYear-value").text(nYear);
                    d3.select("#nYear").property("value", nYear);
                    year = nYear;
                    updateMap(countries, year);
                }


                function updateMap(countries, year){
                    var firstDrawing;

                    if (document.getElementsByClassName("countries-svg").length === 0) {

                        svg = d3.select("#container").append("svg")
                                             .attr("width", width)
                                             .attr("height", height)
                                             .classed("countries-svg", true);

                        line = d3.select("#container").append("svg")
                                             .attr("width", width)
                                             .attr("height", height)
                                             .classed("line-svg", true);
                        firstDrawing = true;
                    } else {
                        firstDrawing = false;
                    }

                    // console.log(countries);



                    if (firstDrawing) {
                        svg.selectAll("path")
                            .data(countries)
                            .enter().append("path")
                            .attr("d", path)
                            .attr("class", "country")
                            .style("fill", function(d) { if (d.hasOwnProperty('unemploymentData')) { return getColor(d['unemploymentData'][year][0]['Value']); } else { return getColor(0); } })
                            .classed("eu-country", isEuCountry);
                    } else {
                        var paths = d3.selectAll("svg.countries-svg path").data(countries);
                        paths.transition()
                            .duration(250)
                            .style("fill", function(d) { if (d.hasOwnProperty('unemploymentData')) { return getColor(d['unemploymentData'][year][0]['Value']); } else { return getColor(0); } });

                        paths.classed("eu-country", isEuCountry);
                    }


                    // var text = svg.selectAll("text")
                    //     .data(countries)
                    //     .enter()
                    //     .append("text");

                    // var textLabels = text
                    //     .attr("x", function(d){
                    //         return path.centroid(d)[0];
                    //     })
                    //     .attr("y", function(d){
                    //         return  path.centroid(d)[1];
                    //     })
                    //     .text( function (d) {
                    //         if (d.hasOwnProperty('unemploymentData')) {
                    //             return d['unemploymentData'][0]['Value'];
                    //         }
                    //     })
                    //     .attr("font-family", "sans-serif")
                    //     .attr("font-size", "6px")
                    //     .attr("fill", "black");

                    d3.selectAll(".eu-country")
                    .on("mouseover", function (d) {
                        div.transition()
                            .duration(200)
                            .style("opacity", .9);
                        var percent = d['unemploymentData'][year][0]['Value'];

                        if(percent === ":") {
                            percent = "No data available";
                        } else {
                            percent = percent.toString(10) + "%";
                        }
                        div .html(d.properties.name + " </br> " + percent)
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                    })
                    .on("mouseout", function() {
                        div.transition()
                            .duration(500)
                            .style("opacity", 0);
                    })
                    .on("click", function(d) {
                        console.log(d)
                        drawChart(d);
                    });
                }

                function drawChart(country) {
                    console.log(country);

                    x.domain(country['unemploymentData'].map(function (d) {
                        console.log(d)
                        return d[0]['TIME'];
                    }));
                //     y.domain([
                //         d3.min(country['unemploymentData'], function (c) {
                //             return d3.min(c.values, function (d) { return d.value; });
                //         }),
                //         d3.max(country['unemploymentData'], function (c) {
                //             return d3.max(c.values, function (d) { return d.value; });
                //         })
                //     ]);

                //     var line = d3.svg.line()
                //         .interpolate("cardinal")
                //         .x(function (d) { return x(d.label) + x.rangeBand() / 2; })
                //         .y(function (d) { return y(d.value); });



                    var chart = svg.selectAll(".series")
                        console.log(country['unemploymentData'])
                        .data(country.unemploymentData)
                      .enter().append("g")
                        .attr("class", "lineChart");

                    chart.append("path")
                        .attr("class", "line")
                        .attr("d", function (d) {
                            if(d){
                                // console.log(d[0]['GEO']);
                                // console.log(d);
                                // return line(d[0]['Value']);
                            }

                        })
                        .style("stroke", function (d) { return color(d.name); })
                        .style("stroke-width", "4px")
                        .style("fill", "none");


                }



                d3.select("#nYear").on("input", function() {
                  updateYear(+this.value);
                  console.log("Jaar" + this.value);
                });

                updateYear(2000);
            });

    });

})();