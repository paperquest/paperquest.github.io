 /*
* Creates, draw and specify interaction for the Fringe global.view
*/

// To create a class with static methods (basically, a namespace)
var fringeView = (function () {

// Except for the (static) background elements, everything is computed on-the-fly
function initializeVis(){
    createStaticElements();
    updateVis(0);   //don't animate at creation
}

// Update the vis, with or without animating the transitions. The callback will be called at the end of all animations
function updateVis(animate,callback){
    computeVisibleFringe();
    drawStaticElements();
    manageDynamicElements(animate);
    bindListeners();
}

// Update fringe and animate the change
function updateFringe() {
    algorithm.updateFringe();
    updateVis(1);
    // the updateFringe button becomes useless until new papers are (de)selected
    d3.select("#updateFringe").attr("disabled","disabled");
}

//////////////////  Drawing functions   ///////////////////////


// Given the current windows dimensions, which papers can be displayed on the Fringe?
function computeVisibleFringe(){
  global.visibleFringe = P.sortedFringe().slice(0,maxNumberOfVisiblePapers());
}

// Create some svg elements, once and for all
function createStaticElements(){
    // toread
    svg.append("circle")
    .attr("id","toread")
    //.attr("class","shadowOnHover")    // for some reason the circle changes size when adding the shadow...

    // core
    svg.append("circle")
    .attr("id","core")
    .attr("class","shadowOnHover")  

    // controls
    d3.select("body").append("button")
    .attr("id","updateFringe")
    .attr("class","visControl")
    .text("Update fringe")
    .attr("onclick","fringeView.updateFringe()")
    .attr("disabled","disabled");   // there's nothing to update when the fringe has just been created

    d3.select("body").append("label")
    .attr("id","updateFringeAutomatically")
    .attr("class","visControl")
    .append("input")
    .attr("type","checkbox")
    .attr("onclick","global.updateAutomatically=!global.updateAutomatically; fringeView.updateFringe()")
    d3.select("#updateFringeAutomatically")
    .append("span")
    .text("automatically")
}

// draw the static elements at their appropriate positions
function drawStaticElements(){
    d3.select("#updateFringe")
    .style("top",updateFringeButtonY()+"px")
    .style("left",updateFringeButtonX()+"px")

    d3.select("#updateFringeAutomatically")
    .style("top",updateFringeButtonY()+3+"px")
    .style("left",updateFringeButtonX()+130+"px")

    // toread
    d3.select("#toread")
    .attr("cx",-fringeRadius+global.fringeApparentWidth)
    .attr("cy","50%")
    .attr("r",fringeRadius)
    .style("fill",colors.toread)
    .style("stroke",colors.toreadBorder)
    .style("stroke-width",2)
    
    // core  --- Deprecated
/*    d3.select("#core")
    .attr("cx",-coreRadius[global.view]+coreApparentWidth[global.view])
    .attr("cy","50%")
    .attr("r",coreRadius[global.view])
    .style("fill",colors.core[global.view])*/
}


// Manage papers on the fringe, with or without animating the transitions (TODO)
function manageDynamicElements(animate){

    //------------------DATA JOIN-------------------//
    // Join new data with old elements, if any

    var papers = svg.selectAll(".paper")
    .data(global.visibleFringe, function(p) { return global.visibleFringe.indexOf(p); })
        // using this key function is critical to ensure papers will change position when updating the fringe

    //--------------------ENTER---------------------//
    // Create new elements as needed

    var enteringPapers = papers.enter()
    .append("g")
    .attr("class","paper")
    .attr("id", function(p) { return p.doi;})

    var zoom0 = enteringPapers.append("g")
    .attr("class","zoom0")

    zoom0.append("rect")
    .attr("class","card")
    .moveToBackOf(svg)  // eventually we'll have to make these follow the selected papers during animations

    zoom0.append("circle")
    .attr("class","outerNode")
    .style("fill","white")

    // the outer circle displays the larger (relative) citation count
    zoom0.append("circle")
    .attr("class", "outerCitationsCircle")
    .style("fill", function(p) { return fringePaperOuterColor(p); })

    zoom0.append("circle")
    .attr("class", "innerCitationsCircle")
    .style("fill", function(p) { return fringePaperInnerColor(p); })

    zoom0.append("text")
    .attr("class", "title")
    .classed("highlighted", function(p) { return p.selected; })
    .attr("dy",".35em")     // align ligne middle
    .text(function(p) { return p.title; })
    .style("opacity","0")   // otherwise it looks ugly when they come in
    .append("svg:title")
    .text(function(p){ return p.citation_count + " external, " + p.citations.length + " internal; "
        + p.citation_count/externalCitationCountCutoff+ " adjusted external, "
        + p.citations.length/internalCitationCountCutoff+ " adjusted internal";})

    enteringPapers.append("a")
    .attr("xlink:href",function(p) { return "http://dl.acm.org/citation.cfm?id="+p.doi.slice(p.doi.indexOf("/")+1); })
    .attr("xlink:show","new")   // open in a new tab
    .append("text")
    .attr("class", "metadata")
    .text(function(p) { return p.metadataToString(); } )
    .style("opacity","0")       // used for smooth fade-in apparition

    enteringPapers.append("foreignObject")
    .attr("class","abstractWrapper")
    .append("xhtml:body")
    .append("div")
    .attr("class","abstract")
    .text(function(p) { return p.abstract; })
    .style("width",abstractLineWidth+"px")
    .each(function(p) {
      // stores the height of the abstract, to be used later
      p.abstractHeight = d3.select(this).node().offsetHeight;
    })
    .style("height","0px")   // for a nice unfolding entrance animation

    //------------------ENTER+UPDATE-------------------//
    // Appending to the enter selection expands the update selection to include
    // entering elements; so, operations on the update selection after appending to
    // the enter selection will apply to both entering and updating nodes.

    var t0=papers.transition().duration(fringePapersPositionTransitionDuration[animate]).ease(fringePapersTransitionEasing)
    global.animationRunning=true;

    t0.each(function(p) {
        if(!p.selected && !userData.newSelectedPapers.hasOwnProperty(p.doi)){
            // for horizontal and vertical scaling: matrix(sx, 0, 0, sy, x-sx*x, y-sy*y)
            var scaling="matrix(" + compressionRatio[global.zoom] + ",0,0," + compressionRatio[global.zoom] +","
                + (fringePaperX(p)-compressionRatio[global.zoom]*fringePaperX(p)) +","
                + (fringePaperY(p)-compressionRatio[global.zoom]*fringePaperY(p)) +")";   

            d3.select(this).attr("transform",scaling)

            if(userData.newSelectedPapers.length>0 || P.selected().length>0)
                d3.select(this).style("opacity",opacityOfNonSelectedPapers[global.zoom])
            else
                d3.select(this).style("opacity",1)
        }
        else{
            d3.select(this).attr("transform",null)
            d3.select(this).style("opacity",1)
        }

    })

      // TODO: refactoring, not sure what this does, doesn't seem to trigger
    t0.select(".card")
    .attr("x", function(p) { return fringePaperXCard(p);} )
    .attr("y", function(p) { return fringePaperYCard(p);} )
    .attr("width", function(p) { return d3.select(this.parentNode).select(".title").node().getComputedTextLength();} )
    .attr("height",2*paperMaxRadius)

    t0.select(".outerCitationsCircle")
    .attr("cx", function(p) { return fringePaperX(p);} )
    .attr("cy", function(p) { return fringePaperY(p);} )
    .attr("r", function(p) {return radius(p,true);} )
    
    // The change of color should occur AFTER the papers have moved to their new positions
    t0.call(endAll, function () {
        // A new transition is generated after all elements of t0 have finished
        var t1=papers.transition().duration(fringePapersColorTransitionDuration[animate]);

        t1.select(".outerCitationsCircle")
        .style("fill", function(p) { return fringePaperOuterColor(p); })

        t1.select(".innerCitationsCircle")
        .style("fill", function(p) { return fringePaperInnerColor(p); })

        // When t1 finishes, check whether an animation is waiting (for update automatically)
        t1.call(endAll, function(){
            global.animationRunning=false;
            if(global.animationWaiting){
                updateFringe();
                global.animationWaiting=false;
            }
        })
    });


    // I really don't understand why this doesn't work on page update (animate=false)
    // Basically the second animation cancels the first one, although the staging works fine when duration>0...
/*   t0.transition().duration(fringePapersColorTransitionDuration[animate])
    .select(".outerCitationsCircle")
    .style("fill", function(d) { return colorFromUpvoters(userData.papers[d].upvoters); })*/
    
    t0.select(".innerCitationsCircle")
    .attr("cx", function(p) { return fringePaperX(p);} )
    .attr("cy", function(p) { return fringePaperY(p);} )
    .attr("r", function(p) {return radius(p,false);} )

    t0.select(".title")
    .attr("x", function(p) { return fringePaperX(p)+paperMaxRadius+titleLeftMargin;} )
    .attr("y", function(p) {return fringePaperY(p);} )
    .style("opacity","1")

    /* the following elements are sometimes not visible. we use a fade-in to show and hide them,
    * but it also necessary to remove them from the display when they aren't suppose to be there,
    * otherwise they will impede selection of other elements (as they may be drawn on top of these). */

    t0.select(".metadata")
    .attr("x", function(p) { return fringePaperX(p)+paperMaxRadius+titleLeftMargin;} )
    .attr("y", function(p) {return fringePaperY(p)+metadataYoffset;} )
    .style("opacity", function(p) { return (p.selected && global.zoom>=1) ? 1: 0;})
    .style("display", function(p) { return (p.selected && global.zoom>=1) ? "": "none";})

    t0.selectAll(".abstractWrapper")
    .attr("x", function(p) { return fringePaperX(p)+paperMaxRadius+titleLeftMargin;} )
    .attr("y", function(p) {return fringePaperY(p)+metadataYoffset+abstractYoffset;} )
    .attr("width",abstractLineWidth)
    .attr("height", function(p) { return p.abstractHeight;})

    t0.selectAll(".abstract")
    .style("height", function(p) { return (p.selected && global.zoom>=2) ?
                                            p.abstractHeight+"px": "0px";})

    // the outerNodes (white borders to highlight selected papers) are shown only for the selected papers
    t0.select(".outerNode")
    .attr("cx", function(p) { return fringePaperX(p);} )
    .attr("cy", function(p) { return fringePaperY(p);} )
    .attr("r", function(p) {return maxRadius(p)+paperOuterBorderWidth;} )
    .style("display", function(p) { return p.selected ? "" : "none"; })

    //--------------------EXIT---------------------//
    // Remove old elements as needed.

    papers.exit()
        // Trying to shrink the exiting papers. Works, but the coordinate space is not relative to current position => big translation     
/*        .transition().duration(fringePapersPositionTransitionDuration[animate])
.attr("transform","matrix(1,0,0,.5,0,0)")*/
.remove();
}


// Specify interaction
function bindListeners(){

    d3.selectAll(".shadowOnHover")
    .on("mouseover",function() {
        d3.select(this).attr("filter","url(#drop-shadow)")
    })
    .on("mouseleave",function() {
        d3.select(this).attr("filter","none")
    })

    // highlight nodes and titles
    d3.selectAll(".zoom0")
    .on("mouseover",function() {
        d3.select(this).select(".outerCitationsCircle").attr("filter","url(#drop-shadow)")
        d3.select(this).select(".title").classed("highlighted",true)    // add class
        d3.select(this).select(".card")
        .classed("highlighted",true)
        .attr("width", function(p) { return d3.select(this.parentNode).select(".title").node().getComputedTextLength();} )
    })
    .on("mouseleave",function() {
        // remove shadow
        d3.select(this).select(".outerCitationsCircle").attr("filter","none")
        
        // keep the selected elements highlighted
        var nonSelectedOnly=d3.select(this)
        .filter(function(){ 
                // this is ugly as hell, but I don't know how to access d cleanly...
                var res;
                d3.select(this).each(function(p) {
                    res=!p.selected;
                })
                return res;
            })
        nonSelectedOnly.select(".title").classed("highlighted",false)     // remove class
        nonSelectedOnly.select(".card").classed("highlighted",false)     // remove class
    })

    // clicking papers on the fringe translates them to the left
    .on("mousedown",function() {
        var paper=d3.select(this);
        paper.each(function(p) {
            p.selected = !p.selected;

            // Add or remove the paper to the list that will update the fringe
            if(p.selected)
              userData.addNewSelected(p);
            else
              userData.removeSelected(p);

            // Enable or disable the updateFringe button, if new papers have been (de)selected
            if((userData.newSelectedPapers.length>0 || userData.newDeselectedPapers.length>0) && !global.updateAutomatically)
                d3.select("#updateFringe").attr("disabled",null);
            else
                d3.select("#updateFringe").attr("disabled","disabled");

            // Update the vis to move the selected papers left or right
            // (using different animation speeds depending on the zoom level, just because it's pretty)
            switch(global.zoom){
                case 0:
                updateVis(4);
                break;
                case 1:
                case 2:
                updateVis(3);
                break;
                case 3:
                updateVis(2);
                break;
            }
        });
    })

    // After (de)selecting a paper, update the fringe if updateAutomatically is true
    .on("mouseup",function(){

        if(!global.updateAutomatically)
            return;

        // We have to make sure that the animation for "selected" is finished   
        if(!global.animationRunning)
            updateFringe();
        else    
            global.animationWaiting=true; // otherwise we wait for it to end
    })

    d3.select("#core").on("click",function(){
        d3.select(this).attr("transform","matrix(sx, 0, 0, sy, cx-sx*cx, cy-sy*cy)")
    })

    // detect zoom in and out
    svg.on("wheel",function(){

        // Do nothing if it is a browser zoom (ctrl+wheel)
        if(d3.event.ctrlKey)
            return;

        // compute the new zoom level
        if(d3.event.deltaY>0){
            if(global.zoom<2)
                global.zoom++;
            else
                global.scrollOffset-=amountOfVerticalScrolling;
            // if the user keeps scrolling down, this will be interpreted as a scrolling down
        }
        else{
            if(global.scrollOffset<0)
                global.scrollOffset+=amountOfVerticalScrolling;
            else{
                if(global.zoom>0)
                    global.zoom--;
            }
        }
        console.log("zoom: "+global.zoom)

        // Update the view (quickly), to take into account the new heights of the selected papers
        fringeView.updateVis(2);
    })
}

////////////////    helper functions    //////////////

// Compute the height of a paper on the fringe, depending on the zoom level and whether it is selected
function fringePaperHeight(p) {
    // If the paper is not selected, its height decreases with the zoom level
    if(!p.selected)
        return 2*paperMaxRadius*compressionRatio[global.zoom];

    // If the paper is selected, its height increases with the zoom level
    var height=2*paperMaxRadius;

    if(global.zoom>=1)
        height += metadataYoffset-paperMaxRadius;

    // The height of the abstract must be computed for each paper individually
    if(global.zoom>=2)
        height += p.abstractHeight;

    // add some whitespace at the bottom to distinguish one paper from the next
    if(global.zoom>0)
        height += paperMarginBottom;

    return height;
}

// Compute X coordinate for a paper on the fringe, based on a circle
function fringePaperX(p) {
  var selectedOffset = p.selected ?  0 : paperXOffsetWhenSelected;
  return circleX(fringePaperY(p)) + selectedOffset;
}

// Return the x coordinate corresponding to a y position on the circle
function circleX(y) {
  var h = window.innerHeight;
  var centerXoffset = -fringeRadius + global.fringeApparentWidth;
  return centerXoffset + Math.sqrt(Math.pow(fringeRadius, 2) - Math.pow(h/2 - y, 2));
}

// Compute Y coordinate for a paper on the fringe
function fringePaperY(p) {
  var index = global.visibleFringe.indexOf(p);
    
  // compute the sum of the height of the papers that are above the current one in the fringe
  var offset = global.scrollOffset;
  for(var i=0; i<index; i++){
    offset += fringePaperHeight(global.visibleFringe[i])
  }

  return offset + paperMaxRadius;
}

// Compute X coordinate for the "card" (the rectangle label) of a paper on the fringe
function fringePaperXCard(p){
    return fringePaperX(p)+paperMaxRadius+titleLeftMargin;
}

// Compute Y coordinate for the "card" (the rectangle label) of a paper on the fringe
function fringePaperYCard(p){
    return fringePaperY(p)-paperMaxRadius;
}

/* Compute how many papers can be displayed on the fringe at the minimum zoom level
* When zooming in, some of these papers will get pushed outside the view, but it's fine (nice animation).
* Takes into account some space at the bottom of the fringe to show an update button. */
function maxNumberOfVisiblePapers(){
    var availableHeight=window.innerHeight-fringeBottomMargin;
    return Math.floor(availableHeight/(2*paperMaxRadius));
}

function updateFringeButtonY(){
    return window.innerHeight-fringeBottomMargin;
}

// Compute the horizontal position of the updateFringe button
function updateFringeButtonX(){
    var h=window.innerHeight;
    var centerXoffset=-fringeRadius+global.fringeApparentWidth;
    return centerXoffset+Math.sqrt(Math.pow(fringeRadius,2)-Math.pow(h/2-updateFringeButtonY(),2))+paperMaxRadius+100;
}

// Compute a node radius for the appropriate citation count supplied, up to a certain max radius
// So far I'm interpolating with a sqrt, to emphasize the differences between 0 citations and a few
function radius(p, outer){

    var externalLarger = isExternalRelativelyLargerThanInternal(p);
    var representingExternal= (externalLarger == outer);
    var count=representingExternal? p.citation_count/externalCitationCountCutoff
     : p.citations.length/internalCitationCountCutoff;

    return Math.min(paperMaxRadius, paperMaxRadius*count);
}

function maxRadius(p){
    return Math.max(radius(p,true), radius(p,false));
}

// Return a random color from the set of tag colors
function randomColor(){
    var keys=Object.keys(colors.tags);
    return colors.tags[keys[ keys.length * Math.random() << 0]];
}

function colorFromUpvoters(n){
    if(n>5)
        return colors.tags[4];
    return colors.tags[n-1];  // between 1..4
}

function fringePaperOuterColor(p) {
    var base=colorFromUpvoters(p.upvoters);
    //console.log(global.papers[doi].citations.length/internalCitationCountCutoff + " " +global.papers[doi].citation_count/externalCitationCountCutoff)
    if(!isExternalRelativelyLargerThanInternal(p))
        return base;
    //console.log("outer "+shadeHexColor(base,shadingDifferenceInnerOuter))
    return shadeHexColor(base,shadingDifferenceInnerOuter);
}

function fringePaperInnerColor(p) {
    var base=colorFromUpvoters(p.upvoters);
    if(isExternalRelativelyLargerThanInternal(p)){
        //console.log("internal "+base)       
        return base;
    }
    return shadeHexColor(base,shadingDifferenceInnerOuter);
}

function isExternalRelativelyLargerThanInternal(p){
    return p.citation_count/externalCitationCountCutoff
    > p.citations.length/internalCitationCountCutoff;
}

///////////////     Define public static methods, and return    /////////////

var fringeView = {};

fringeView.initializeVis=initializeVis;
fringeView.updateVis=updateVis;
fringeView.updateFringe=updateFringe;

return fringeView;

})();
