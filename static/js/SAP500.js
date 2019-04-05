var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#sap500Chart1")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

  // Append an SVG group
var chartGroup = svg.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`);

function marketRanges(spData, threshold) {

    var markets = [];

    var dates = spData.map(function(d) {
        return(d.Date);
    });

    var closePrices = spData.map(function(d) {
        return(d.Close);
    })

    var bearMarket = false;

    var bullStart = 0
    var bearStart = 0

    var currentHigh = closePrices[0];
    var currentLow = closePrices[0];

    for (var i = 0; i < spData.length; i++) {

        changeFromHigh = (closePrices[i] - currentHigh)/currentHigh * 100;
        changeFromLow = (closePrices[i] - currentLow)/currentLow * 100;

        if (bearMarket === false) {
            if (closePrices[i] > currentHigh) {
                currentHigh = closePrices[i];
            }
        }

        if (bearMarket === true) {
            if (closePrices[i] < currentLow) {
                currentLow = closePrices[i];
            }
        }

        if (bearMarket === false) {
            if (changeFromHigh <= (threshold * -1)) {
                 var marketObject = {
                    type: "bull",
                    dateRange: dates.slice(bullStart, i),
                    priceRange: closePrices.slice(bullStart, i),
                    marketRange: spData.slice(bullStart, i)
                };
                markets.push(marketObject);
                bearMarket = true;
                currentLow = closePrices[i];
                bearStart = i;
            }
        }

        if (bearMarket === true) {
            if (changeFromLow >= threshold) {
                var marketObject = {
                    type: "bear",
                    dateRange: dates.slice(bearStart, i),
                    priceRange: closePrices.slice(bearStart, i),
                    marketRange: spData.slice(bearStart, i)
                };
                markets.push(marketObject);
                bearMarket = false;
                currentHigh = closePrices[i];
                bullStart = i;
            }
        }

        if (bearMarket === false && i === (spData.length - 1)) {
            var marketObject = {
                type: "bull",
                dateRange: dates.slice(bullStart, i + 1),
                priceRange: closePrices.slice(bullStart, i + 1),
                marketRange: spData.slice(bullStart, i + 1)
            };
            markets.push(marketObject);
        }

        if (bearMarket === true && i === (spData.length -1)) {
            var marketObject = {
                type: "bear",
                dateRange: dates.slice(bearStart, i + 1),
                priceRange: closePrices.slice(bearStart, i + 1),
                marketRange: spData.slice(bearStart, i + 1)
            };
            markets.push(marketObject);
        }

    };

    return(markets);

}

var threshold = 5;

// Retrieve data from the CSV file and execute everything below
d3.json('/sap500_data', function(err, data) {
    if (err) throw err;

    var spData = JSON.parse(data);
    console.log(spData);

    var parseTime = d3.timeParse("%m/%d/%Y");

    // var parseTime = d3.time.format("%m/%d/%Y");

    spData.forEach(function(data) {
        data.Date = parseTime(data.Date);
        data.Close = +data.Close;
    });

    xTimeScale = d3.scaleTime()
        .domain(d3.extent(spData, d => d.Date))
        .range([0, width]);

    // console.log(marketRanges(spData, 20)[0].marketRange[0])
    // console.log(xTimeScale(marketRanges(spData, 20)[0].marketRange[0].Date))    

    var yLinearScale1 = d3.scaleLinear()
        .domain(d3.extent(spData, d => d.Close))
        .range([height, 0]);

    lineGenerator = d3.line()
        .x(d => xTimeScale(d.Date))
        .y(d => yLinearScale1(d.Close))

    var bottomAxis = d3.axisBottom(xTimeScale)
        .tickFormat(d3.timeFormat("%Y"));
    var leftAxis = d3.axisLeft(yLinearScale1);

    chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
    chartGroup.append("g").call(leftAxis);

    var chartLines = chartGroup.selectAll('.line')
        .data(marketRanges(spData, threshold))
        .enter()
        .append("path")
        .attr("d", function(d) {
            // console.log("d", d.marketRange);
            // console.log("d2", lineGenerator(d.marketRange));
            return lineGenerator(d.marketRange)
        })
        .classed("line", true)
        .classed("bear", function(d) {
            return d.type == "bear";
        })
        .classed("bull", function(d) {
            return d.type == "bull";
        })

    // console.log(marketRanges(spData, 20))
    
});

// var svgWidth2 = 960;
// var svgHeight2 = 500;

// var margin2 = {
//   top: 20,
//   right: 40,
//   bottom: 80,
//   left: 100
// };

// var width2 = svgWidth2 - margin2.left - margin2.right;
// var height2 = svgHeight2 - margin2.top - margin2.bottom;

// var svg2 = d3
//   .select("#sap500Chart2")
//   .append("svg")
//   .attr("width", svgWidth2)
//   .attr("height", svgHeight2);

//   // Append an SVG group
// var chartGroup2 = svg2.append("g")
// .attr("transform", `translate(${margin.left}, ${margin.top})`);

// // Create function for percent changes
// function priceChange(spData, threshold) {

//     var priceChanges = [];

//     var dates = spData.map(function(d) {
//         return(d.Date);
//     });

//     var closePrices = spData.map(function(d) {
//         return(d.Close);
//     });

//     var bearMarket = false;

//     var currentHigh = closePrices[0];
//     var currentLow = closePrices[0];

//     var priceVar;
//     var percentVar;

//     for (var i = 0; i < spData.length; i++) {

//         if (i === 0) {
//             priceVar = closePrices[i] - 1418.30;
//             percentVar = (closePrices[i] - 1418.30) / 1418.30 * 100;
//             var priceObject = {
//                 type: "bull",
//                 date: dates[i],
//                 priceChange: priceVar,
//                 percentChange: percentVar
//             };
//             priceChanges.push(priceObject)
//         } else if (bearMarket === false) {
//             priceVar = closePrices[i] - closePrices[i - 1];
//             percentVar = (closePrices[i] - closePrices[i - 1]) / closePrices[i - 1] * 100;
//             var priceObject = {
//                 type: "bull",
//                 date: dates[i],
//                 priceChange: priceVar,
//                 percentChange: percentVar
//             };
//             priceChanges.push(priceObject)
//         } else {
//             priceVar = closePrices[i] - closePrices[i - 1];
//             percentVar = (closePrices[i] - closePrices[i - 1]) / closePrices[i - 1] * 100;
//             var priceObject = {
//                 type: "bear",
//                 date: dates[i],
//                 priceChange: priceVar,
//                 percentChange: percentVar
//             };
//             priceChanges.push(priceObject)

//         }

//         changeFromHigh = (closePrices[i] - currentHigh)/currentHigh * 100;
//         changeFromLow = (closePrices[i] - currentLow)/currentLow * 100;

//         if (bearMarket === false) {
//             if (closePrices[i] > currentHigh) {
//                 currentHigh = closePrices[i];
//             }
//         }

//         if (bearMarket === true) {
//             if (closePrices[i] < currentLow) {
//                 currentLow = closePrices[i];
//             }
//         }

//         if (bearMarket === false) {
//             if (changeFromHigh <= (threshold * -1)) {
//                 bearMarket = true;
//                 currentLow = closePrices[i];
//             }
//         }

//         if (bearMarket === true) {
//             if (changeFromLow >= threshold) {
//                 bearMarket = false;
//                 currentHigh = closePrices[i];
//             }
//         }
//     };
    
//     return priceChanges;
// }
// // Create function to generate price ranges for histogram
// function priceRanges (priceChanges) {
//     // var percentRange = d3.max(priceChanges, d => d.percentChange) - d3.min(priceChanges, d => d.percentChange)
//     var priceRange = d3.max(priceChanges, d => d.priceChange) - d3.min(priceChanges, d => d.priceChange);

//     var histogramBarCount = 100;

//     var histogramRange = priceRange / histogramBarCount;

//     var priceRanges = [];

//     var frequencyVar = 0;

//     for (var i = 0; i < histogramBarCount; i++) {

//         var beginningPrice = d3.min(priceChanges, d => d.priceChange) + (i * histogramRange);
//         var endPrice = d3.min(priceChanges, d => d.priceChange) + ((i + 1) * histogramRange);

//         var beginningRound = Math.round((beginningPrice + 0.00001) * 100) / 100;
//         var beginningString = beginningRound.toString();

//         var endRound = Math.round((endPrice + 0.00001) * 100) / 100;
//         var endString = endRound.toString();

//         var priceString = beginningString + " to " + endString;

//         var priceObject = {
//             rangeString: priceString,
//             frequency: frequencyVar,
//             begin: beginningPrice,
//             end: endPrice,
//         };

//         priceRanges.push(priceObject);

//     };

//     for (var y = 0; y < priceRanges.length; y++) {

//         var currentCount = 0;

//         for (var z = 0; z < priceChanges.length; z++) {
//             if (priceChanges[z].priceChange >= priceRanges[y].begin && priceChanges[z].priceChange < priceRanges[y].end) {
//                 currentCount = currentCount + 1;
//                 priceRanges[y].frequency = currentCount;
//             }
//         }

//     };


//     return priceRanges;
// }
// // Retrieve data from the CSV file and execute everything below
// d3.json('/sap500_data', function(err, data) {
//     if (err) throw err;

//     var spData = JSON.parse(data);

//     var parseTime = d3.timeParse("%m/%d/%Y");

//     spData.forEach(function(data) {
//         data.Date = parseTime(data.Date);
//         data.Close = +data.Close;
//     });
//     // console.log(priceRanges(priceChange(spData, 10)))
//     // console.log(priceChange(spData, 10));

//     var priceChangeData = priceChange(spData, threshold);

//     var histData = priceRanges(priceChangeData);
//     // console.log(histData);

//     var bands = histData.map(d => d.rangeString);
//     console.log(bands);

//     var freqArray = histData.map(d => d.frequency);
//     console.log(freqArray);

//     var yScale = d3.scaleLinear()
//         .domain([0, d3.max(freqArray)])
//         .range([height2, 0]);

//     var xScale = d3.scaleBand()
//         .domain(bands)
//         .range([0, width2])
//         .padding(0);
    
//     var xAxis = d3.axisBottom(xScale);
//     var yAxis = d3.axisLeft(yScale);

//     chartGroup2.append("g")
//         .call(yAxis);
    
//     chartGroup2.append("g")
//         .attr("transform", `translate(0, ${height2})`)
//         .call(xAxis);
    
//     chartGroup2.selectAll("rect")
//         .data(freqArray)
//         .enter()
//         .append("rect")
//         .attr("x", (d, i) => xScale(bands[i]))
//         .attr("y", d => yScale(d))
//         .attr("width", xScale.bandwidth())
//         .attr("height", d => height2 - yScale(d))
//         // .attr("fill", d => rgb(d * 10, 200, 200));
//         // .attr("fill", (d, i) => d3.rgb(150,50,50))
//         .attr("fill", function(d, i) {
//             // var red = 255 / ((i + 1) / 40);
//             var red = 100 * window.innerWidth / xScale(bands[i]);
//             var green = 500 * xScale(bands[i]) / window.innerWidth;
//             return d3.rgb(red, green, 0);
//         })
//     // var yScale = d3.scaleLinear()
//     //     .domain()

// });


// var svgWidth3 = 960;
// var svgHeight3 = 500;

// var margin3 = {
//   top: 20,
//   right: 40,
//   bottom: 80,
//   left: 100
// };

// var width3 = svgWidth3 - margin3.left - margin3.right;
// var height3 = svgHeight3 - margin3.top - margin3.bottom;

// var svg3 = d3
//   .select("#sap500Chart3")
//   .append("svg")
//   .attr("width", svgWidth3)
//   .attr("height", svgHeight3);

//   // Append an SVG group
// var chartGroup3 = svg3.append("g")
// .attr("transform", `translate(${margin.left}, ${margin.top})`);


// function bullFilter (priceChanges) {
//     return priceChanges.type === "bull";
// }
// // Retrieve data from the CSV file and execute everything below
// d3.json('/sap500_data', function(err, data) {
//     if (err) throw err;

//     var spData = JSON.parse(data);

//     var parseTime = d3.timeParse("%m/%d/%Y");

//     spData.forEach(function(data) {
//         data.Date = parseTime(data.Date);
//         data.Close = +data.Close;
//     });
//     // console.log(priceRanges(priceChange(spData, 10)))
//     // console.log(priceChange(spData, 10));

//     var priceChangeData = priceChange(spData, threshold);

//     var bullFilterData = priceChangeData.filter(bullFilter);

//     var histData = priceRanges(bullFilterData);
//     // console.log(histData);

//     var bands = histData.map(d => d.rangeString);
//     console.log(bands);

//     var freqArray = histData.map(d => d.frequency);
//     console.log(freqArray);

//     var yScale = d3.scaleLinear()
//         .domain([0, d3.max(freqArray)])
//         .range([height3, 0]);

//     var xScale = d3.scaleBand()
//         .domain(bands)
//         .range([0, width2])
//         .padding(0);
    
//     var xAxis = d3.axisBottom(xScale);
//     var yAxis = d3.axisLeft(yScale);

//     chartGroup3.append("g")
//         .call(yAxis);
    
//     chartGroup3.append("g")
//         .attr("transform", `translate(0, ${height3})`)
//         .call(xAxis);
    
//     chartGroup3.selectAll("rect")
//         .data(freqArray)
//         .enter()
//         .append("rect")
//         .attr("x", (d, i) => xScale(bands[i]))
//         .attr("y", d => yScale(d))
//         .attr("width", xScale.bandwidth())
//         .attr("height", d => height3 - yScale(d))
//         // .attr("fill", d => rgb(d * 10, 200, 200));
//         // .attr("fill", (d, i) => d3.rgb(150,50,50))
//         .attr("fill", function(d, i) {
//             // var red = 255 / ((i + 1) / 40);
//             var red = 100 * window.innerWidth / xScale(bands[i]);
//             var green = 500 * xScale(bands[i]) / window.innerWidth;
//             return d3.rgb(red, green, 0);
//         })
//     // var yScale = d3.scaleLinear()
//     //     .domain()

// });


// var svgWidth4 = 960;
// var svgHeight4 = 500;

// var margin4 = {
//   top: 20,
//   right: 40,
//   bottom: 80,
//   left: 100
// };

// var width4 = svgWidth4 - margin4.left - margin4.right;
// var height4 = svgHeight4 - margin4.top - margin4.bottom;

// var svg4 = d3
//   .select("#sap500Chart4")
//   .append("svg")
//   .attr("width", svgWidth4)
//   .attr("height", svgHeight4);

//   // Append an SVG group
// var chartGroup4 = svg4.append("g")
// .attr("transform", `translate(${margin.left}, ${margin.top})`);


// function bearFilter (priceChanges) {
//     return priceChanges.type === "bear";
// }
// // Retrieve data from the CSV file and execute everything below
// d3.json('/sap500_data', function(err, data) {
//     if (err) throw err;
//     console.log(data);

//     var spData = JSON.parse(data);

//     var parseTime = d3.timeParse("%m/%d/%Y");

//     spData.forEach(function(data) {
//         data.Date = parseTime(data.Date);
//         data.Close = +data.Close;
//     });
//     // console.log(priceRanges(priceChange(spData, 10)))
//     // console.log(priceChange(spData, 10));

//     var priceChangeData = priceChange(spData, threshold);

//     var bearFilterData = priceChangeData.filter(bearFilter);

//     var histData = priceRanges(bearFilterData);
//     // console.log(histData);

//     var bands = histData.map(d => d.rangeString);
//     console.log(bands);

//     var freqArray = histData.map(d => d.frequency);
//     console.log(freqArray);

//     var yScale = d3.scaleLinear()
//         .domain([0, d3.max(freqArray)])
//         .range([height4, 0]);

//     var xScale = d3.scaleBand()
//         .domain(bands)
//         .range([0, width4])
//         .padding(0);
    
//     var xAxis = d3.axisBottom(xScale);
//     var yAxis = d3.axisLeft(yScale);

//     chartGroup4.append("g")
//         .call(yAxis);
    
//     chartGroup4.append("g")
//         .attr("transform", `translate(0, ${height4})`)
//         .call(xAxis);
    
//     chartGroup4.selectAll("rect")
//         .data(freqArray)
//         .enter()
//         .append("rect")
//         .attr("x", (d, i) => xScale(bands[i]))
//         .attr("y", d => yScale(d))
//         .attr("width", xScale.bandwidth())
//         .attr("height", d => height4 - yScale(d))
//         // .attr("fill", d => rgb(d * 10, 200, 200));
//         // .attr("fill", (d, i) => d3.rgb(150,50,50))
//         .attr("fill", function(d, i) {
//             // var red = 255 / ((i + 1) / 40);
//             var red = 100 * window.innerWidth / xScale(bands[i]);
//             var green = 500 * xScale(bands[i]) / window.innerWidth;
//             return d3.rgb(red, green, 0);
//         })
//     // var yScale = d3.scaleLinear()
//     //     .domain()

// });


