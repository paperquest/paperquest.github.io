/* 
 * Calls the appropriate rendering functions to create and update the vis
 */

// Determine which dataset to use, by looking for "papers=" in the query string
var params = getQueryParameters();
var datasetName = params["papers"] || "hci";
global.dataset = parameters.datasets[datasetName];
console.log("Loading papers dataset ", global.dataset);

// Send tracking data to Google Analytics
ga('set', 'page', '/stats/'+global.dataset.name);
ga('send', 'pageview');

var svg = d3.select("body").append("svg")
   .attr("width", window.innerWidth)
   .attr("height", 2.5 * window.innerHeight);


// Initialize visualization (eventually calling these methods from the js file corresponding to the current view )
d3.json("data/" + global.dataset.file, function(data) {
   global.papers = data.papers;
   global.computeMedianMaximalNormalizedCitationCountsPerYear();
   initializeView();
});


// Dynamic resize
window.onresize = function() {
   svg.remove();

   svg = d3.select("body").append("svg")
      .attr("width", window.innerWidth)
      .attr("height", 2.5 * window.innerHeight)

   initializeView();
}

function initializeView() {

   var papers = Object.keys(global.papers);

   /*  // Remove the papers for which we didn't get the Google citation count
       var papersForExternalCitations=Object.keys(global.papers).filter(function(doi){
           return !(global.papers[doi].citation_count==0 && global.papers[doi].citations.length>0);
       })*/

   function generateDataScatterplot(x, y) {
      var data = [];
      papers.forEach(function(doi) {
         data.push({
            "x": x(doi),
            "y": y(doi)
         });
      })
      return data;
   }

   function generateValuesHistogram(y) {
      var values = [];
      papers.forEach(function(doi) {
         values.push(y(doi));
      })
      return values;
   }

   var width = window.innerWidth / 2,
      height = window.innerHeight / 2;


   histogram(svg, 0, 0, width, height, 20, 0, 20,
      generateValuesHistogram(function(doi) {
         return P(doi).getInternalCitationCount();
      }),
      "internal citations", "number of papers");

   histogram(svg, width, 0, width, height, 20, 0, 400,
      generateValuesHistogram(function(doi) {
         return P(doi).citation_count;
      }),
      "external citations", "number of papers");


   scatterplot(svg, 0, height, width, height, true, false,
      generateDataScatterplot(function(doi) {
            return P(doi).citation_count;
         },
         function(doi) {
            return P(doi).getInternalCitationCount();
         }),
      "external citations", "internal citations");

   scatterplot(svg, width, height, width, height, false, false,
      generateDataScatterplot(function(doi) {
            return P(doi).getNormalizedExternalCitationCount();
         },
         function(doi) {
            return P(doi).getNormalizedInternalCitationCount();
         }),
      "normalized external citations", "normalized internal citations");


   scatterplot(svg, 0, 2 * height, width, height, true, true,
      generateDataScatterplot(function(doi) {
            return P(doi).year;
         },
         function(doi) {
            return P(doi).getInternalCitationCount();
         }),
      "year", "internal citations");

   scatterplot(svg, width, 2 * height, width, height, true, true,
      generateDataScatterplot(function(doi) {
            return P(doi).year;
         },
         function(doi) {
            return P(doi).citation_count;
         }),
      "year", "external citations");


   scatterplot(svg, 0, 3 * height, width, height, false, true,
      generateDataScatterplot(function(doi) {
            return P(doi).year;
         },
         function(doi) {
            return P(doi).getNormalizedInternalCitationCount();
         }),
      "year", "normalized internal citations");

   scatterplot(svg, width, 3 * height, width, height, false, true,
      generateDataScatterplot(function(doi) {
            return P(doi).year;
         },
         function(doi) {
            return P(doi).getNormalizedExternalCitationCount();
         }),
      "year", "normalized external citations");


   scatterplot(svg, 0, 4 * height, width, height, false, true,
      generateDataScatterplot(function(doi) {
            return P(doi).year;
         },
         function(doi) {
            return P(doi).getMaximumNormalizedCitationCount();
         }),
      "year", "Maximum of Normalized Citation Count");


   scatterplot(svg, width, 4 * height, width, height, false, true,
      generateDataScatterplot(function(doi) {
            return P(doi).year;
         },
         function(doi) {
            return P(doi).adjustedCitationCount();
         }),
      "year", "Adjusted Citation Count");
}


/* helpers */

function getQueryParameters() {
   if (!window.location.search)
      return [];
   return window.location.search.replace(/(^\?)/, '').split("&").map(function(n) {
      return n = n.split("="), this[n[0]] = n[1], this
   }.bind({}))[0];
}

function generateQueryString(parameters) {
   var query = '?';
   for (var param in parameters) {
      query += param + '=' + parameters[param];
   }
   return query;
}
