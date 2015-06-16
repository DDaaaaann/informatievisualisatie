(function () {
    "use strict";


    var year = 2000;
    var width = 1200,
        height = 700;

    // To scale and translate map
    var projection = d3.geo.mercator()
        .scale(600)
        .translate([width/4, height/2 +600]);

    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var barColor = d3.scale.ordinal()
        .range(["#98abc5", "#8a89a6", "#7b6888"]);

    var path = d3.geo.path().projection(projection);

    var margin = {top: 20, right: 10, bottom: 10, left: 20},
        barWidth = 330 - margin.left - margin.right,
        barHeight = 230 - margin.top - margin.bottom;

    var x0 = d3.scale.ordinal()
        .rangeRoundBands([0, barWidth], .1);

    var x1 = d3.scale.ordinal();

    var y = d3.scale.linear()
        .range([barHeight, 0]);

    var xAxis = d3.svg.axis()
        .scale(x0)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(function(d) { return parseInt(d, 10) + "%"; });

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
        // of > 0
        if(hue > -1) {
            return ["hsl(3,",hue,"%,45%)"].join("");
        } else {
            return "black";
        }
    }



    d3.json("eu.json", function (error, europe) {
        if (error) return console.error(error);

        var eu = topojson.feature(europe, europe.objects.europe),
            countries = eu.features;

        console.log(countries)


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
                    // adjust the text on the range slider
                    d3.select("#nYear-value").text(nYear);
                    d3.select("#nYear").property("value", nYear);
                    year = nYear;
                    updateMap(countries, year);
                }


                function updateMap(countries, year){
                    var firstDrawing;

                    if (document.getElementsByClassName("countries-svg").length === 0) {
                        var svg = d3.select("#container").append("svg")
                                             .attr("width", width)
                                             .attr("height", height)
                                             .classed("countries-svg", true);
                        firstDrawing = true;
                    } else {
                        firstDrawing = false;
                    }

                    console.log(countries);

                    if (firstDrawing) {
                        svg.selectAll("path")
                            .data(countries)
                            .enter().append("path")
                            .attr("d", path)
                            .attr("class", "country")
                            .style("fill", function(d) {
                                if (d.hasOwnProperty('unemploymentData')) { 
                                    return getColor(d['unemploymentData'][year][0]['Value']); 
                                } else { 
                                    return getColor(0); 
                                } 
                            })
                            .classed("eu-country", isEuCountry);
                    } else {
                        var paths = d3.selectAll("svg.countries-svg path").data(countries);
                        paths.transition()
                            .duration(250)
                            .style("fill", function(d) { 
                                if (d.hasOwnProperty('unemploymentData')) { 
                                    return getColor(d['unemploymentData'][year][0]['Value']); 
                                } else { 
                                    return getColor(0); 
                                } 
                            });

                        paths.classed("eu-country", isEuCountry);
                    }

                    d3.selectAll(".eu-country")
                    .on("mouseover", function (d) {
                        div.transition()
                            .duration(200)
                            .style("opacity", .9);
                        // var percent = d['unemploymentData'][year][0]['Value'];

                        // if(percent === ":") {
                        //     percent = "No data available";
                        // } else {
                        //     percent = percent.toString(10) + "%";
                        // }

                        var firstDrawing;

                        if (document.getElementsByClassName("country-barsvg").length === 0) {
                            var barSvg = div.append("svg")
                                .attr("width", barWidth + margin.left + margin.right)
                                .attr("height", barHeight + margin.top + margin.bottom)
                                .classed("country-barsvg", true)
                                .append("g")
                                .attr("transform", "translate(" + margin.left + ",0)");

                            firstDrawing = true;
                        } else {
                            firstDrawing = false;
                        }

                        var twoGroups = {"Less than 25 years" : [], "From 25 to 74 years" : []};

                        for (var row in d['unemploymentData'][year]) {
                            if (d['unemploymentData'][year][row].AGE === "Less than 25 years") {
                                if (d['unemploymentData'][year][row].Value === ":") {
                                    twoGroups[d['unemploymentData'][year][row].AGE].push({ name: d['unemploymentData'][year][row].SEX, value: 0 });     
                                } else {
                                    twoGroups[d['unemploymentData'][year][row].AGE].push({ name: d['unemploymentData'][year][row].SEX, value: d['unemploymentData'][year][row].Value }); 
                                }
                            } else if (d['unemploymentData'][year][row].AGE === "From 25 to 74 years") {
                                if (d['unemploymentData'][year][row].Value === ":") {
                                    twoGroups[d['unemploymentData'][year][row].AGE].push({ name: d['unemploymentData'][year][row].SEX, value: 0 });     
                                } else {
                                    twoGroups[d['unemploymentData'][year][row].AGE].push({ name: d['unemploymentData'][year][row].SEX, value: d['unemploymentData'][year][row].Value }); 
                                }
                            }
                        }

                        var sexNames = ["Males", "Females", "Total"];
                        x0.domain(Object.keys(twoGroups).map(function(d) { return d; }));
                        x1.domain(sexNames).rangeRoundBands([0, x0.rangeBand()]);

                        var max = 0;
                        d3.values(twoGroups).forEach(function(d) {
                            d.forEach(function(f) {
                                if (f.value !== ":" && parseInt(f.value) > max) {
                                    max = parseInt(f.value);
                                }
                            });
                        });
                        var max = d3.max(d3.values(twoGroups), function(d) { return d3.max(d, function(d) { return parseInt(d.value); }); });
                        y.domain([0, max]);

                        if (firstDrawing) {
                            barSvg.append("g")
                                .attr("class", "x axis")
                                .attr("transform", "translate(0," + barHeight + ")")
                                .call(xAxis);

                             barSvg.append("g")
                                .attr("class", "y axis")
                                .call(yAxis)
                                .append("text")
                                .attr("transform", "rotate(-90)")
                                .attr("y", 6)
                                .attr("dy", ".71em")
                                .style("text-anchor", "end")
                                .text("Population")
                                .classed("tick_text");

                            var ageGroup = barSvg.selectAll(".yeargroup")
                                .data(d3.values(twoGroups))
                                .enter().append("g")
                                .attr("class", "g")
                                .attr("transform", function(d, i) { 
                                    if (i === 0) {
                                        return "translate(" + x0("Less than 25 years") + ",0)";
                                    } else if (i === 1) {
                                        return "translate(" + x0("From 25 to 74 years") + ",0)";
                                    }
                                })
                                .classed("yeargroup", true);

                            ageGroup.selectAll("rect")
                                .data(function(d) {return d; })
                                .enter().append("rect")
                                .attr("width", x1.rangeBand())
                                .attr("x", function(d) { return x1(d.name); })
                                .attr("y", function(d) { return y(d.value); })
                                .attr("height", function(d) { return barHeight - y(d.value); })
                                .style("fill", function(d) { return barColor(d.name); })
                                .classed("barchart-rect", true);
                        } else {
                            var newYAxis = d3.select("g.y")
                                .call(yAxis)
                                .append("text")
                                .attr("transform", "rotate(-90)")
                                .attr("y", 6)
                                .attr("dy", ".71em")
                                .style("text-anchor", "end")
                                .classed("tick_text");

                            var yeargroups = d3.selectAll(".yeargroup").data(d3.values(twoGroups));
                            var rects = yeargroups.selectAll(".barchart-rect")
                                .data(function(d) { return d; })
                                .attr("width", x1.rangeBand())
                                .attr("x", function(d) { return x1(d.name); })
                                .attr("y", function(d) { return y(d.value); })
                                .attr("height", function(d) { return barHeight - y(d.value); })
                                .style("fill", function(d) { return barColor(d.name); })
                                .classed("barchart-rect", true);
                            console.log(yeargroups);
                            console.log(rects);
                        }
                        
                        div.style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                    })
                    .on("mouseout", function() {
                        div.transition()
                            .duration(500)
                            .style("opacity", 0);
                    });
                }

                d3.select("#nYear").on("input", function() {
                  updateYear(+this.value);
                  console.log("Jaar" + this.value);
                });

                updateYear(2000);
            });

    });

})();