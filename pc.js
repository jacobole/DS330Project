var xyList = ["year", "power"]
    let output = document.getElementById('output');
      function selectOption() {
         let dropdown = document.getElementById('dropdown');
         // get the index of the selected option
         let selectedIndex = dropdown.selectedIndex;
         // get a selected option and text value using the text property
         let selectedValue = dropdown.options[selectedIndex].text;
         output.innerHTML = "The selected value for x-axis is " + selectedValue;
         xyList[0] = selectedValue
         drawSPlot(xyList[0], xyList[1]);
      }
      
    let output2 = document.getElementById('output2');
      function selectOption2() {
         let dropdown2 = document.getElementById('dropdown2');
         // get the index of the selected option
         let selectedIndex2 = dropdown2.selectedIndex;
         // get a selected option and text value using the text property
         let selectedValue2 = dropdown2.options[selectedIndex2].text;
         output2.innerHTML = "The selected value for y-axis is " + selectedValue2;
         xyList[1] = selectedValue2
         drawSPlot(xyList[0], xyList[1]);
      }

//define the svg area
var margin = {top: 30, right: 10, bottom: 10, left: 10},
    width = 1200 - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom;


//define the the axes in parallel coordinate
var x = d3.scale.ordinal().rangePoints([0, width], 1),
    y = {};

var line = d3.svg.line()
          .x(function(d) { return d.x; })
          .y(function(d) { return d.y; })
          .interpolate("linear");

var axis = d3.svg.axis().orient("left");


//define the array for multi-dimensional data
var cars = []; 

//define the array to hold all lines
var polyLines = [];
    dots = [];

//create the svg
var svg = d3.select(".chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//read the data from a file
d3.csv("cars.csv", type, function(error, data) {
    cars = data;//assign the data to the array
    drawpc(); //draw the graph
    //drawxyplot();
});

function drawpc() {
    polyLines.length = 0;
    // Extract the list of dimensions and create a scale for each.
    x.domain(dimensions = d3.keys(cars[0]).filter(function(d) {
                return d != "name" && 
                (y[d] = d3.scale.linear()
                            .domain(d3.extent(cars, function(p) { return +p[d]; }))
            .range([height, 0]));
    }));

    // Add polylines
    for (var i=0; i< cars.length; i++) {
        var lineData = [];
        
        //prepare data
        for (var prop in cars[i]) {
             if (prop != "name" ) {
                 var point = {};
                 var val = cars[i][prop];
                 point['x'] = x(prop)/2;
                 point['y'] = y[prop](val);
                 lineData.push(point);
             }
        }
        
        //draw a poly line
        var pLine=svg.append("g")
                    .attr("class", "polyline")    
                    .append("path")
                    .attr("d", line(lineData))
                    .attr("idx", i)
                    .on("mouseover", function() {//highlight a line when cursor hovering
                        var ind = d3.select(this).attr("idx");
                        highlightData(ind);
                    })                  
                    .on("mouseout", function(d) {//restore the original color
                        var ind2 = d3.select(this).attr("idx");
                        deHighlightData(ind2);
                    });
                        
        polyLines.push(pLine); //add a polyline to the array

    }

    //add dimension axes 
    var g = svg.selectAll(".dimension")
	   .data(dimensions)
	   .enter().append("g")
	   .attr("class", "dimension")
	   .attr("transform", function(d) { return "translate(" + x(d)/2 + ")"; });
    
    //add an axis and title.
    g.append("g")
	   .attr("class", "axis")
	   .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
	   .append("text")
	   .style("text-anchor", "middle")
	   .attr("y", -9)
	   .text(function(d) { return d; });
    
};

function type(d) {
    d.economy = +d.economy; // coerce to number
    d.displacement = +d.displacement; // coerce to number
    d.power = +d.power; // coerce to number
    d.weight = +d.weight; // coerce to number
    d.year = +d.year;
	return d;
}




//Scatterplot code


//define the the axes of the scatter plot
var x2 = d3.scale.linear().range([650, width]),
    y2 = d3.scale.linear().range([height-20,0]);


//define the array to hold all lines
var  dots = [];


//read the data from a file
d3.csv("cars.csv", type, function(error, data) {
    cars = data;//assign the data to the array
    var xInit = "year";
    var yInit = "power";
    drawSPlot(xInit, yInit);//draw the graph
});

//draw scatter plot
function drawSPlot(xVar, yVar){
    
    //clearing everything then redrawing first graph, so that dropdown menu can work
    dots.length = 0;
    svg.selectAll("g").remove();
    drawpc();
    
    
    //define axes
    var xAxis = d3.svg.axis()
	   .scale(x2)
	   .orient("bottom");
    
    var yAxis = d3.svg.axis()
	   .scale(y2)
	   .orient("left");
    
    
    // for whatever reason, min and max functions weren't working properly for acceleration, so I had to manually set the domain if acceleration is selected
    if (xVar == "acceleration") {
        x2.domain([8, 24.6]);
    } else {
        x2.domain([d3.min(cars, function(d) { return d[xVar]; }),
			 d3.max(cars, function(d) { return d[xVar]; })]);
    }
    
    if (yVar == "acceleration") {
        y2.domain([8, 24.6]);
    } else {
        y2.domain([d3.min(cars, function(d) { return d[yVar]; }),
			d3.max(cars, function(d) { return d[yVar]; })]);
    }
    
    
    //draw axes
    var xPosition = height -20;
    svg.append("g")
	   .attr("class", "xaxis")
	   .attr("transform", "translate(0," + xPosition + ")")
	   .call(xAxis);

    var yPosition = 650;
    svg.append("g")
	   .attr("class", "yaxis")
	   .attr("transform", "translate(" + yPosition + ", 0)")
	   .call(yAxis);
    
    //draw dots
    for (var i=0; i<cars.length; i++) {
     
     //draw a dot
     var dot = svg.append("g")
	   .append("circle")
	   .attr("class", "dot")
	   .attr("cx", function(d) { return x2(cars[i][xVar]); })
	   .attr("cy", function(d) { return y2(cars[i][yVar]); })
	   .attr("idx", i)
	   .attr("r", 3)
    	   .style("fill", "black")
	   .on("mouseover", function(d) {
               var ind3 = d3.select(this).attr("idx");
               highlightData(ind3);
	   })                  
	   .on("mouseout", function(d) {
               var ind4 = d3.select(this).attr("idx");
               deHighlightData(ind4);
	   });                  
     
     dots.push(dot);//push the dot to the array
    }
}

//function to coerce numerial data
function type(d) {
    d.economy = +d.economy; // coerce to number
    d.displacement = +d.displacement; // coerce to number
    d.power = +d.power; // coerce to number
    d.weight = +d.weight; // coerce to number
    d.year = +d.year;
	return d;
}

//highlight data elements
function highlightData(i) {
dots[i].style("fill", "red").attr("r", 5);
polyLines[i].style("stroke", "red").style("stroke-width", 5);
}
//restore the color of the highlighted elements
function deHighlightData(i) {
dots[i].style("fill", "black").attr("r", 3);
polyLines[i].style("stroke", "#666").style("stroke-width", 1);
}

