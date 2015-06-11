(function () {
    "use strict";

    var width = 1200,
        height = 700;

    var projection = d3.geo.mercator()
        .scale(600)
        .translate([width/3, height/2 +600])
        .precision(.1);

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

    d3.json("eu.json", function (error, europe) {
        if (error) return console.error(error);

        var svg = d3.select("#container").append("svg")
                                         .attr("width", width)
                                         .attr("height", height);

        var eu = topojson.feature(europe, europe.objects.europe),
            countries = eu.features;



        countries.forEach(function(d) {


            // console.log(d.properties )

        });


        // var b = path.bounds(eu),
        //     s = 0.95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
        //     t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
        //     console.log(s)
        //     console.log(t)
        // projection.scale(1).translate(1,1);

        console.log(countries)

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