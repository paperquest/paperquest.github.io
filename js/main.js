/* 
 * Calls the appropriate rendering functions to create and update the vis
 */

// Determine which dataset to use, by looking for "papers=" in the query string
var params = getQueryParameters();
var datasetName = params["papers"] || "hci";
global.dataset = parameters.datasets[datasetName];
console.log("Loading papers dataset ", global.dataset);

// Send tracking data to Google Analytics
ga('set', 'page', '/main/'+global.dataset.name);
ga('send', 'pageview');

$(document).ready(function() {
   // Change the label of the menu item for switching datasets
   $("#switch-dataset").text("Load " + global.dataset.switchDatasetMenuLabel + " papers")

   // Change the link to the dataset statistics page
   $("#dataset-stats").prop("href", "./stats.html?papers=" + global.dataset.name);

   // Change the placeholder in the typeahead
   $("#dialog .typeahead").prop("placeholder", global.dataset.placeholder);
})

// I'm not sure what was the point of .select("body").append("svg") instead of select("svg")...
var svg = d3.select("svg#main-view")
   .attr("width", window.innerWidth)
   .attr("height", window.innerHeight);


// Initialize visualization, with creating the background elements by default
function initializeVisualization(createStaticElements) {
   d3.json("data/" + global.dataset.file, function(data) {
      // Cache the dataset
      global.papers = data.papers;

      // Initialize some global parameters
      global.computeOldestLatestPublicationYears();
      global.computeMedianMaximalNormalizedCitationCountsPerYear();

      // Restore data from previous session
      sessionManager.loadPreviousSession();

      // If no seed papers, won't do anything
      algorithm.updateFringe();
      view.initializeView(createStaticElements);

      // setup autocomplete popup
      $('#dialog .typeahead').typeahead({
         hint: true,
         highlight: true,
         minLength: 3
      }, {
         name: 'titles',
         displayKey: 'value',
         source: substringMatcher(Object.keys(global.papers)
            .map(function(doi) {
               return global.papers[doi].title;
            }))
      });
   });
}

initializeVisualization(true);

// Dynamic resize
window.onresize = function() {
   svg.attr("width", window.innerWidth)
      .attr("height", window.innerHeight);
   view.updateView(0); // don't animate on resize
}

// Handle the "add seed paper" dialog
$("#add-seed").on("click", function() {
   $("#dialog")
      .css("left", window.innerWidth / 2 - $("#dialog").width() / 2)
      .css("top", window.innerHeight / 2 - $("#dialog").height() / 2)

   $("#overlay").width(window.innerWidth).height(window.innerHeight)

   if(global.fullPaperTitle)
         addCorePaper($('#dialog .typeahead').typeahead('val'));
      else
         global.fullPaperTitle = false;
         
   toggleDialog();

   $('#dialog .typeahead').focus();
})

function toggleDialog() {
   console.log("toggleDialog");
   $("#dialog").toggle()
   $("#overlay").toggle()

   var adding = $("#dialog").css("display") != "none";
   $("#add-seed").html(adding ? "Done" : "+Add")
   $('#dialog .typeahead').typeahead("val", "")
}

// When autocomplete has been succesful, add a paper when enter is pressed
$('#dialog .typeahead').on("typeahead:autocompleted", function(e, s, d) {
   global.fullPaperTitle = true;
})
$('#dialog .typeahead').on("typeahead:selected", function() {
   global.fullPaperTitle = true;
})
$('#dialog .typeahead').on("keypress", function(e) {
   if (e.which == 13 && global.fullPaperTitle) {
      addCorePaper($('#dialog .typeahead').typeahead('val'));
      toggleDialog();
   }
})

// Add a paper to the core based on its title
function addCorePaper(title) {

   // find the doi
   for (var doi in global.papers) {
      if (global.papers[doi].title == title) {
         console.log("adding " + doi + " to core");

         var from;
         var p = P(doi);
         if (userData.papers[doi] === undefined) {
            from = 0; // unknown
            userData.papers[doi] = p;
            if (p.isStump) {
               p.inflate();
            }
         } else
            from = p.weightIndex();

         p.moveTo("core");
         // Add the paper to the core, via the list that will update the fringe
         userData.addToQueue(p, from, p.weightIndex());

         view.updateUpdateFringeButton();
         view.doAutomaticFringeUpdate(); // if necessary
         view.updateView(2);
      }
   }
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
