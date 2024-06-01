// Updates selection
function onCategoryChanged() {
    var select = d3.select('#categorySelect').node();
    // Get current value of select element
    category = select.options[select.selectedIndex].value;
    console.log(category)
    // Update chart with the selected category of letters
    updateChart(category);
}

// Adding the svg
var svg = d3.select('svg');
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');
var padding = {t: 20, r: 20, b: 60, l: 60};

// Dimensions of the trellis plots
trellisWidth = svgWidth / 2 - padding.l - padding.r;
trellisHeight = svgHeight / 2 - padding.t - padding.b;

// Background rects for the trellis plots
svg.selectAll('.background')
    .data(['A', 'B', 'C', 'D'])
    .enter()
    .append('rect')
    .attr('class', 'background')
    .attr('width', trellisWidth) 
    .attr('height', trellisHeight)
    .attr('transform', function(d, i) {
        var tx = (i % 2) * (trellisWidth + padding.l + padding.r) + padding.l;
        var ty = Math.floor(i / 2) * (trellisHeight + padding.t + padding.b) + padding.t;
        return 'translate('+[tx, ty]+')';
    });


// Load data
d3.csv('locations.csv').then(function(dataset) {

    // Store data
    weather = dataset;
    parseDate = d3.timeParse("%Y-%m-%d");

    // Domains
    dateDomain = [new Date(2014, 5, 30), new Date(2015, 5, 30)];
    tempDomain = [-27, 122];

    // Parse
    for (count = 0; count < weather.length; count++) {
        weather[count].date = parseDate(weather[count].date)
    }

    // Nesting
    nested = d3.nest()
        .key(function(weather) {
            return weather.location;
        })
        .entries(weather);

    // Adding group
    group = svg.selectAll('.sector')
        .data(nested)
        .enter()
        .append("g")
        .attr("class", "trellis")
        .attr('transform', function(d, i) {
            var tx = (i % 2) * (trellisWidth + padding.l + padding.r) + padding.l;
            var ty = Math.floor(i / 2) * (trellisHeight + padding.t + padding.b) + padding.t;
            return 'translate('+[tx, ty]+')';
        });

    //Scales
    xScale = d3.scaleTime()
        .domain(dateDomain)
        .range([0, trellisWidth])

    yScale = d3.scaleLinear(tempDomain)
        .domain(tempDomain)
        .range([trellisHeight, 0])

    // Line
    lineInterpolate = d3.line()
        .x(function(weather) {
            return xScale(weather.date);
        })
        .y(function(weather) {
            return yScale(weather.actual_mean_temp);
        })

    path = d3.select("svg").selectAll('g.trellis')
        .append("path")
        .attr("class", "line-plot")
        .attr("id", "line-display")


    line = d3.selectAll("path.line-plot")
        .attr('d', function(weather) {
            return lineInterpolate(weather.values);
        })
        .style("stroke", "#333")

    // Axis
    xAxis = d3.axisBottom(xScale)

    axisX = group.append("g")
        .attr("class", "x-axis")
        axisX.call(xAxis)
        .attr("transform", "translate(0," + trellisHeight +")")
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-65)")

    yAxis = d3.axisLeft(yScale)
    
    axisY = group.append("g")
        .attr("class", "y-axis")
        axisY.call(yAxis)

    // Array for location Labels
    placeList = []
    place = ""
    for (count = 0; count < nested.length; count++) {
        place = nested[count].key.toString()
        console.log(place )
        placeList.push(place)
    }

    // Color scale
    colorScale =  d3.scaleOrdinal(d3.schemeTableau10)

    // Labeling
    title = d3.select("svg").selectAll('g.trellis')
        .append("text")
        .attr("class", "location-label")
        .text(function(d) {
            return d.key;
        })
        .style("fill", function(d, i){
            return d.color = colorScale(i);
        })
        .attr("transform", "translate(130,30)")

    label1 = d3.select("svg").selectAll('g.trellis')
        .append("text")
        .attr("class", "x axis-label")
        .text("Month")
        .attr("transform", "translate(130,275)")

    label2 = d3.select("svg").selectAll('g.trellis')
        .append("text")
        .attr("class", "y axis-label")
        .text("Average temperature")
        .attr("transform", "translate(-30,110) rotate(-90)")
});

// Updates the graphs
function updateChart(filterKey) {
    // Changing data based on selection
    if (filterKey === "actual-temperature") {  
        var lineInterpolate = d3.line()
            .x(function(weather) {
                return xScale(weather.date);
            })
            .y(function(weather) {
                return yScale(weather.actual_mean_temp);
        }) 

    } else if (filterKey === "max-temperature") {  
        var lineInterpolate = d3.line()
            .x(function(weather) {
                return xScale(weather.date);
            })
            .y(function(weather) {
                return yScale(weather.record_max_temp);
        }) 
    } else {
        var lineInterpolate = d3.line()
            .x(function(weather) {
                return xScale(weather.date);
            })
            .y(function(weather) {
                return yScale(weather.record_min_temp);
    }) 
    }
    
    // Graphs the line
    path = d3.select("svg").selectAll('g.trellis')
        .append("path")
        .attr("class", "line-plot")
        .attr("id", "line-display")

    line = d3.selectAll("path.line-plot")
        .attr('d', function(weather) {
        return lineInterpolate(weather.values);
    })
        .style("stroke", "FF4433")
}