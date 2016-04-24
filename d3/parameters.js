/*
 * Parameters required for building the visualization in d3.
 * All the other appearance parameters are defined in CSS.
 */

var parameters = {

   /*    papers datasets   */

   "datasets": {
      "hci": {
         "name": "hci",
         "file": "citeology.json",
         "switchDatasetMenuLabel": "VIS",
         "placeholder": "e.g. Instrumental Interaction"
      },
      "vis": {
         "name": "vis",
         "file": "IEEE_VIS_papers_1990-2014.json",
         "switchDatasetMenuLabel": "HCI",
         "placeholder": "e.g. A Nested Model for Visualization Design and Validation"
      }
   },

   /*    papers parameters       */

   "paperMaxRadius": 15,
   "paperOuterBorderWidth": 4,
   // between on paper and the next (again, to create visual grouping)
   "paperMarginBottom": 10,
   // margin between node and title
   "titleLeftMargin": 5,
   // how far to the right are paper that come in and out of the fringe (not used yet)
   "papersEnteringDistance": 60,
   // so far used only for wrapping the text of the abstract
   "abstractLineWidth": 800,

   // vertical offset of the different components of the paper (1.8*parameters.paperMaxRadius)
   "metadataYoffset": 26,
   // in addition to metadaYoffset, the abstract has an offset of:
   "abstractYoffset": 7,

   // Indicates how much the non-selected papers are shrunk when "zoom"=0,1,2
   "compressionRatio": [1, .8, 0],
   "opacityOfNonSelectedPapers": [.7, .45, 0],


   /*     views parameters       */

   "fringeRadius": 2000,
   // The apparent width is the horizontal space that we want the region to occupy on the screen
   // An appropriate offset for the x-position of the center will be computed as -radius+apparentWidth
   "fringeApparentWidthMin": 200,
   "fringeApparentWidthMax": 1200,
   "fringeRightPadding": 350,
   // the current value of fringeApparentWidth varies, hence is define in global

   // to leave room for the "update" button
   "fringeBottomMargin": 40,

   // to-read list left margin, to leave room for the menu
   "toreadPaperMargin": 35,
   // to-read list top and bottom margins
   "toreadMarginTop": 15,
   "toreadMarginBottom": 20,

   // core list top and bottom margins
   "coreMarginTop": 15,
   "coreMarginBottom": 20,

   // heuristic average of pixels used by each letter
   "pixelsPerLetter": 9,
   // extra padding (empty pixels) to the right of titles
   "toreadTitlePadding": 50,


   /*     sideview Parameters      */

   "nBinsYears": 6,

   /*     dynamic parameters       */

   // Defines 3 types of animation: none, slow, fast, very fast
   "fringePapersTransitionEasing": "quad-in-out",
   "fringePapersPositionTransitionDuration": [0, 1000, 450, 250, 120],
   "fringePapersColorTransitionDuration": [0, 500, 0, 0, 0],

   // Duration for link in and out animations
   "linkTransitionDuration": 200,


   /*     data parameters       */

   // Current year must always be one year after the latest year in the dataset (2010 for citeology)
   "currentYear": 2011, // legacy - only used for displaying the graph of the old citation count
   "externalCitationCountCutoff": 400,
   "internalCitationCountCutoff": 20,


   /*     algorithm parameters       */
   // If this weight is >> 1, the fringe is mostly sorted by ACC
   "ACCweight": 1,
   // If this weight is >> 1, the fringe is mostly sorted by color (= connectivity)
   "connectivityWeight": 1,
   // Relative weight of the different types of paper
   "coreWeight": 5,
   "toReadWeight": 3,
   "selectedWeight": 1,
   // Relative weight of the different types of paper: 0=unkown, 1=selected, 2=toread, 3=core
   "weights": [0, 1, 3, 5],


   /*     misc parameters      */

   // The space between a node's glyph and the menu to the left
   "menuOffset": 60,
   // The factor affecting how curved the links are
   "linkCurvature": 0.2,
}


var colors = {
   // orange, green, blue, pink, darkblue
   "tags": ["#F18D05", "#61AE24", "#00A1CB", "#D70060", "#113F8C"],

   // color brewer 6, first excluded
   // "monotone":["#c7e9b4","#7fcdbb","#41b6c4","#2c7fb8","#253494"],
   // Same scale, with bigger steps between colors
   // c7e9b4 7fcdbb 2fa4b2 1a6da6 1d2c8c
   "monotone": [shadeHexColor("#c7e9b4", 0), shadeHexColor("#7fcdbb", 0), shadeHexColor("#41b6c4", -7), shadeHexColor("#2c7fb8", -7), shadeHexColor("#253494", -3)],

   // less conclusive scales
   //"monotone":["#ffffcc","#c7e9b4","#7fcdbb","#41b6c4","#2c7fb8","#253494"],
   //"monotone":["#edf8b1","#7fcdbb","#1d91c0","#253494","#081d58"],

   // how much lighter are the external citations
   "shadingDifferenceInternalExternal": 8,
   // these two colors are pretty, but probably shouldn't be used for tags (too similar)
   "turquoise": "#01A4A4",
   "red": "#E54028",
   // background color of each region based on the current view
   "core": "rgb(255, 191, 175)",
   "coreDivisor": "rgb(223, 111, 95)",
   "toread": "rgb(242, 222, 195)",
   "toreadBorder": "rgb(202, 170, 126)",

   // colors for the links
   "referenceLink": "rgb(120, 120, 120)",
   "citationLink": "rgb(120, 120, 120)"
}
