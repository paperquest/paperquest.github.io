PaperQuest
==========

A visualization tool to support literature review.
Originally a project for CS547 at UBC, a course on Information Visualization (http://www.cs.ubc.ca/~tmm/courses/547-14/) taught by Tamara Munzner (http://www.cs.ubc.ca/~tmm/).


Demo
====

A demo of the system is available at:
http://paperquest.github.io

The source code is available on GitHub:
https://github.com/paperquest/paperquest.github.io

You can contact the authors with any issues or suggestions at the
following email addresses:

* Antoine Ponsard (bycdmcyigbas@gmail.com)
* Francisco Escalona (pax@cs.ubc.ca)


Paper
=====

This project will be presented as a Late-Breaking Work at ACM CHI 2016, in San Jose, Ca
The Extended Abstract describing the project's motivation and design is available at:
http://antoineponsard.com/res/PaperQuest.pdf


Running the code
================

This is a system meant for the web.  You need to have a web server
that can handle http requests installed.  Just copy the directory
structure into a folder that is being served by your computer and then
point a browser to that URL, no need to configure anything else.  If
you experience problems we advice you to first check that your folder
permissions are set correctly.

Note about the data: the original dataset of HCI papers for this project was provided
by Justin Matejka from the Citeology project at Autodesk. The dataset of Information
Visualization papers comes from the Visualization Publication Dataset (http://vispubdata.org), from 
Petra Isenberg, Florian Heimerl, Steffen Koch, Tobias Isenberg, Panpan Xu, Chad Stolper, Michael Sedl- mair, Jian Chen, Torsten Möller, and John Stask.

Code structure
==============

All third party libraries are in the lib/ folder.  The css/ and fonts/
folders contain styles and fonts used by the system, respectively.
The scripts/ folder contains some Python scripts that were used to
parse scraped data.

The first point of contact with the system is in index.html, and most
things happen there.  The rest of the files are JS code that
implements most of the functionality.  It uses D3 (http://d3js.org/)
for the majority of the work.  The following is a breakdown of how the
code is organized, roughly.

 + `js/`
   + `algorithm.js` contains the implementation of the relevance
     algorithm for recommending papers.
   + `geometry.js` has a bunch of helper functions to compute geometry
     of papers and views in the window.
   + `global.js` defines the global state object for the system.
   + `main.js` is the script that gets called first, and is in charge of
     setting up the rest of the vis.  It doesn't do anything after
     that.
   + `papers.js` is an implementation of a paper class in JS that
     presents an abstraction layer from the dataset to the rest of the
     code.
   + `sessionManager.js` uses Local Storage to save and restore user
     sessions.
   + `stats.js` contains helper functionality to render the
     visualizations in stats.html.
   + `userData.js` manages the user's dataset, that is papers and other
     derived attributes relevant to the current user of the system.

 + `d3/`
   + `helpers.js` contains general functions that are useful in many
     places, like a function that truncates text at word boundaries.
   + `histogram.js` contains useful code for building histograms.
   + `scatterplot.js` is the same, but for scatterplots.
   + `update.js` is responsible for much of the interaction in the
     system.  It implements the logic for how things should be
     rendered based on changes in the system's global state.  It's
     code is called frequently to update the visualization and keep it
     current.
   + `udpateSideViews.js` has similar responsibilities, but only for the
     sidebar at the right of the vis.
   + `view.js` sets down the main SVG components of the interface, draws
     the bigger elements like side-by-side views, and connects the
     different listeners to components in the DOM.
   + `parameters.js` is a configuration file with sane defaults for
     how things should work.
