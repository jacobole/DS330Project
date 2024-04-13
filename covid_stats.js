//Width and height
var w = 500;
var h = 300;

//Define map projection
var projection = d3.geoAlbersUsa()
					   .translate([w/2, h/2])
					   .scale([500]);

//Define path generator
var path = d3.geoPath()
				 .projection(projection);
				 
//Number formatting for population values
var formatAsThousands = d3.format(",");  //e.g. converts 123456 to "123,456"

//Create SVG element
var svg = d3.select("body")
			.append("svg")
			.attr("width", w)
			.attr("height", h);

//calling initial graph
drawMap("Cases");
				 
//list to store attribute to be used, this way it can be changed within dropdown menu function
var attLst = [""];

//function to make dropdown menu work
let output = document.getElementById('output');
function selectOption() {
     let dropdown = document.getElementById('dropdown');
     let selectedIndex = dropdown.selectedIndex;
     let selectedValue = dropdown.options[selectedIndex].text;
     attLst[0] = selectedValue;
     drawMap(attLst[0]);
  }

//put everything in a function so it can be called by the dropdown menu function
function drawMap(att){
    //clear everything so that there is only ever one map on screen
    svg.selectAll("path").remove();
    //Define quantize scale to sort data values into buckets of color -- added if/else statements to change color based on attribute
    if (att == "Cases") {
        var color = d3.scaleQuantize()
    					.range(["#74c476","#41ab5d","#238b45","#006d2c","#00441b"]);
    					//Colors taken from colorbrewer.js, included in the D3 download
    } else if (att == "Deaths") {
        var color = d3.scaleQuantize()
    					.range(["#fb6a4a","#ef3b2c","#cb181d","#a50f15","#67000d"]);
    } else {
        var color = d3.scaleQuantize()
    					.range(["#6baed6","#4292c6","#2171b5","#08519c","#08306b"]);
    }
    
    //covid data
    d3.csv("covid_stats.csv", function(data) {
        
        //set value to equal whatever attribute has been selected
        for (var i = 0; i < data.length; i++) {
            if (att == "Cases") {
                data[i].value = data[i].cases;
            } else if (att == "Deaths") {
                data[i].value = data[i].deaths;
            } else {
                data[i].value = data[i].vaccinations;
            }
        }
    
    	//Set input domain for color scale
    	color.domain([
    		d3.min(data, function(d) { return parseFloat(d.value); }), 
    		d3.max(data, function(d) { return parseFloat(d.value); })
    	]);
    
    	//Load in GeoJSON data
    	d3.json("us-states.json", function(json) {
    
    		//Merge the ag. data and GeoJSON
    		//Loop through once for each ag. data value
    		for (var i = 0; i < data.length; i++) {
    	
    			var dataState = data[i].state;				//Grab state name
    			var dataValue = parseFloat(data[i].value);	//Grab data value, and convert from string to float
    	
    			//Find the corresponding state inside the GeoJSON
    			for (var j = 0; j < json.features.length; j++) {
    			
    				var jsonState = json.features[j].properties.name;
    	
    				if (dataState == jsonState) {
    			
    					//Copy the data value into the JSON
    					json.features[j].properties.value = dataValue;
    					
    					//Stop looking through the JSON
    					break;
    					
    				}
    			}		
    		}
    
    		//Bind data and create one path per GeoJSON feature
    		svg.selectAll("path")
    		   .data(json.features)
    		   .enter()
    		   .append("path")
    		   .attr("d", path)
    		   .style("fill", function(d) {
    		   		//Get data value
    		   		var value = d.properties.value;
    		   		
    		   		if (value) {
    		   			//If value exists…
    			   		return color(value);
    		   		} else {
    		   			//If value is undefined…
    			   		return "#ccc";
    		   		}
    		   })
    		   .append("title") //adding tooltip information
    		   .text(function(d) {
    		       if (att == "Vaccinations") {
    		           return d.properties.name + ": " + d.properties.value + "% Vaccinated"; //different formatting needed for vaccination info
    		       } else {
    		           return d.properties.name + ": " + formatAsThousands(d.properties.value) + " " + att; //shows current attribute value
    		       }
    			   });
    
    	});
    
    });
}
