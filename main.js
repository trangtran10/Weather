// **** Example of how to create padding and spacing for trellis plot****
var svg = d3.select('svg');

// Hand code the svg dimensions, you can also use +svg.attr('width') or +svg.attr('height')
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

// Define a padding object
// This will space out the trellis subplots
var padding = {t: 20, r: 20, b: 60, l: 60};

// Compute the dimensions of the trellis plots, assuming a 2x2 layout matrix.
trellisWidth = svgWidth / 2 - padding.l - padding.r;
trellisHeight = svgHeight / 2 - padding.t - padding.b;

// As an example for how to layout elements with our variables
// Lets create .background rects for the trellis plots
svg.selectAll('.background')
    .data(['A', 'B', 'C', 'C']) // dummy data
    .enter()
    .append('rect') // Append 4 rectangles
    .attr('class', 'background')
    .attr('width', trellisWidth) // Use our trellis dimensions
    .attr('height', trellisHeight)
    .attr('transform', function(d, i) {
        // Position based on the matrix array indices.
        // i = 1 for column 1, row 0)
        var tx = (i % 2) * (trellisWidth + padding.l + padding.r) + padding.l;
        var ty = Math.floor(i / 2) * (trellisHeight + padding.t + padding.b) + padding.t;
        return 'translate('+[tx, ty]+')';
    });

var parseDate = d3.timeParse("%Y-%m-%d");
// To speed things up, we have already computed the domains for your scales
var dateDomain = [new Date(2014, 6, 1), new Date(2015, 5, 30)];
var tempDomain = [0, 105];

// **** How to properly load data ****

d3.csv('locations.csv').then(function(dataset) {

// **** Your JavaScript code goes here ****
    for (count = 0; count < dataset.length; count++) {
        console.log(dataset[count].date)
        dataset[count].date = parseDate(dataset[count].date)
        console.log(dataset[count].date)
    }

    var nested = d3.nest()
        .key(function(dataset) {
            return dataset.location;
        })
        .entries(dataset);
    
    console.log(nested)

    var group = svg.selectAll('.sector')
        .data(nested)
        .enter()
        .append("g")
        .attr("class", "trellis")
        .attr('transform', function(d, i) {
            var tx = (i % 2) * (trellisWidth + padding.l + padding.r) + padding.l;
            var ty = Math.floor(i / 2) * (trellisHeight + padding.t + padding.b) + padding.t;
            return 'translate('+[tx, ty]+')';
        });

        
    var xScale = d3.scaleTime()
        .domain(dateDomain)
        .range([0, trellisWidth])

    var yScale = d3.scaleLinear(tempDomain)
        .domain(tempDomain)
        .range([trellisHeight, 0])


    var lineInterpolate = d3.line()
        .x(function(dataset) {
            return xScale(dataset.date);
        })
        .y(function(dataset) {
            return yScale(dataset.actual_mean_temp);
        })


    var path = d3.select("svg").selectAll('g.trellis')
            .append("path")
            .attr("class", "line-plot")

    
    var line = d3.selectAll("path.line-plot")
        .attr('d', function(dataset) {
            return lineInterpolate(dataset.values);
        })
        .style("stroke", "#333")


    var xAxis = d3.axisBottom(xScale)
    var axisX = group.append("g")
        .attr("class", "x-axis")
        axisX.call(xAxis)
        .attr("transform", "translate(0," + trellisHeight +")")


    var yAxis = d3.axisLeft(yScale)
    
    var axisY = group.append("g")
        .attr("class", "y-axis")
        axisY.call(yAxis)

    var xGrid = d3.axisTop(xScale)
        .tickSize(-trellisHeight, 0, 0)
        .tickFormat('')

    var yGrid = d3.axisLeft(yScale)
        .tickSize(-trellisWidth, 0, 0)
        .tickFormat('')

    var grid = d3.select("svg").selectAll('g.trellis')
        .append("g")
        .attr("class", "x grid")
        .call(xGrid)


    var grid = d3.select("svg").selectAll('g.trellis')
        .append("g")
        .attr("class", "y grid")
        .call(yGrid)

    var placeList = []
    var name = ""
    for (count = 0; count < nested.length; count++) {
        name = nested[count].key.toString()
        console.log(name)
        placeList.push(name)
    }

    var colorScale =  d3.scaleOrdinal(d3.schemeCategory10)

    line.style("stroke",function(d, i){
        return d.color = colorScale(i);
    });

    
    var title = d3.select("svg").selectAll('g.trellis')
        .append("text")
        .attr("class", "location-label")
        .text(function(d) {
            return d.key;
        })
        .style("fill", function(d, i){
            return d.color = colorScale(i);
        })
        .attr("transform", "translate(130,30)")


    var label1 = d3.select("svg").selectAll('g.trellis')
        .append("text")
        .attr("class", "x axis-label")
        .text("Month")
        .attr("transform", "translate(130,254)")

    var label2 = d3.select("svg").selectAll('g.trellis')
        .append("text")
        .attr("class", "y axis-label")
        .text("Average temperature")
        .attr("transform", "translate(-30,110) rotate(-90)")

});

// Remember code outside of the data callback function will run before the data loads