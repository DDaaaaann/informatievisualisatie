(function () {
    "use strict";


    var dataYear = [];
    var year = 2000
    var width = 1200,
        height = 700;


    // To scale and translate map
    var projection = d3.geo.mercator()
        .scale(600)
        .translate([width/4, height/2 +600]);

    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var path = d3.geo.path().projection(projection);



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
        var hue=((600*(value/100))).toString(10);
        console.log(hue)
        // of > 0
        if(hue > -1) {
            return ["hsl(3,",hue,"%,45%)"].join("");
        } else {
            return "gray";
        }

    }




    d3.json("eu.json", function (error, europe) {
        if (error) return console.error(error);

        var eu = topojson.feature(europe, europe.objects.europe),
            countries = eu.features;

        console.log(countries)


            d3.csv("unemployment/Unemployment.csv", function(error, data) {

                function updateYear(nYear) {
                    dataYear = [];
                    // adjust the text on the range slider
                    d3.select("#nYear-value").text(nYear);
                    d3.select("#nYear").property("value", nYear);
                    dataYear = []
                    for (var i = 0; i < data.length; i++) {
                        if (data[i]['TIME'] === nYear.toString(10)) {
                            dataYear.push(data[i]);
                            console.log("year: " + nYear);
                        }
                    }
                    console.log(dataYear)
                    eu = topojson.feature(europe, europe.objects.europe),
                        countries = eu.features;
                    for (var i = 0; i < dataYear.length; i++) {
                        for (var j = 0; j < countries.length; j++) {
                            if (countries[j]['properties']['name'] === dataYear[i]['GEO']) {

                                if (!countries[j].hasOwnProperty('unemploymentData')) {
                                    countries[j].unemploymentData = [];

                                }
                                countries[j].unemploymentData.push(dataYear[i]);
                            }
                        }

                    }
                    updateMap(countries)
                }

                function updateMap(countries){
                    d3.select("svg")
                        .remove();

                    var svg = d3.select("#container").append("svg")
                                         .attr("width", width)
                                         .attr("height", height);

                    console.log(countries);

                    svg.selectAll("path")
                        .data(countries)
                        .enter().append("path")
                        .attr("d", path)
                        .attr("class", "country")
                        .style("fill", function(d) { console.log("d" + d); if (d.hasOwnProperty('unemploymentData')) { console.log('has property'); return getColor(d['unemploymentData'][0]['Value']); } else { console.log('has no property'); return getColor(0); } })
                        .classed("eu-country", isEuCountry);


                    var text = svg.selectAll("text")
                        .data(countries)
                        .enter()
                        .append("text");

                    var textLabels = text
                        .attr("x", function(d){
                            return path.centroid(d)[0];
                        })
                        .attr("y", function(d){
                            return  path.centroid(d)[1];
                        })
                        .text( function (d) {
                            if (d.hasOwnProperty('unemploymentData')) {
                                return d['unemploymentData'][0]['Value'];
                            }
                        })
                        .attr("font-family", "sans-serif")
                        .attr("font-size", "6px")
                        .attr("fill", "black");

                    svg.selectAll(".eu-country")
                    .on("mouseover", function (d) {
                        div.transition()
                            .duration(200)
                            .style("opacity", .9);
                        var percent = d['unemploymentData'][0]['Value'];
                        console.log(percent);
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
                        console.log("CLICK D: " + d);
                        drawChart()
                    });
                }

                function drawChart() {
                    div.html("TEST")
                }

                d3.select("#nYear").on("input", function() {
                  updateYear(+this.value);
                  console.log("Jaar" + this.value);
                });

                updateYear(2000);
            });

    });

})();