/*
* Parameters required for building the visualization in d3.
* All the other appearance parameters are defined in CSS.
*/

var paperMaxRadius = 15,
    paperOuterBorderWidth = 4,
    paperMarginBottom = 10,              // between on paper and the next (again, to create visual grouping)
    titleLeftMargin = 5,
    paperXOffsetWhenSelected = (2*paperMaxRadius - titleLeftMargin),
    papersEnteringDistance = 60,        // how far to the right are paper that come in and out of the fringe (not used yet)
    abstractLineWidth = 800,            // so far used only for wrapping the text of the abstract
    fringeBottomMargin = 30;    // to leave room for the "update" button

// Offset of the different components of the paper 
var metadataYoffset = 1.8*paperMaxRadius,
    abstractYoffset = 7;   // in addition to metadaYoffset

// Indicates how much the non-selected papers are shrunk when zoom=0,1,2
var compressionRatio = [1,.8,0],
    opacityOfNonSelectedPapers = [.75,.45,0];

// Defines 3 types of animation: none, slow, fast, very fast
var fringePapersTransitionEasing="quad-in-out",
    fringePapersPositionTransitionDuration=[0,1000,450,250,120],
    fringePapersColorTransitionDuration=[0,500,0,0,0];

var amountOfVerticalScrolling=100;

// Defines the dimension of each region, index by the current view (core, toread, fringe)
// The apparent width is the horizontal space that we want the region to occupy on the screen
// An appropriate offset for the x-position of the center will be computed as -radius+apparentWidth
/*var coreRadius = [120,120,120],
    toreadRadius = [2000,2000,2000],
    fringeRadius = [2000,2000,2000],
    coreApparentWidth = [120,120,120],
    fringeApparentWidth = [420,420,420],
    toreadApparentWidth = [420,420,fringeApparentWidth[2]-paperMaxRadius+titleLeftMargin];*/

var fringeRadius = 2000,
    fringeApparentWidthMin = 420,
    fringeApparentWidthMax = 1200;

var colors={
    // orange, green, blue, pink, darkblue
    "tags":["#F18D05","#61AE24","#00A1CB","#D70060","#113F8C"],
	// thése two colors are pretty, but probably shouldn't be used for tags (too similar)
    "turquoise":"#01A4A4",	    
	"red":"#E54028",		
    // background color of each region based on the current view
    "core":"rgb(223, 111, 95)",
    "toread":"rgb(242, 222, 195)",
    "toreadBorder":"rgb(242, 210, 166)"
}

var shadingDifferenceInnerOuter=20;

var currentYear=2011; // Must always be one year after the latest year in the dataset (2010 for citeology)
var externalCitationCountCutoff=200;
var internalCitationCountCutoff=25;