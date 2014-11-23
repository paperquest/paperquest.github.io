/*
* Global variables
*/

var global={
    // Current view: 0=core, 1=to read, 2=fringe
    "view":2,
    // papers dataset, accessed by global.papers[doi]
    "papers":false,
    // automatically computed by fringeView
    "visibleFringe":[]
};


/* /!\ since we redefine these objects on loading,
*  properties and methods must be defined in main.js on the new objects
*/
var userData={
    
    // contains the tags and all useful information about the papers that have been visited
    "papers":{       
        "10.1145/108844.108867":{
            // Triggers and barriers to customization
            "core":true
        },
        "10.1145/97243.97271":{
            // Buttons
            "core":true
        },
        "10.1007/978-94-011-0349-7_9":{
            // Medium vs Mechanism
            "core":true
        }
    },
    
    // The followings are just lists of dois
    "core":[
        // Triggers and barriers to customization
        "10.1145/108844.108867",
        // Buttons
        "10.1145/97243.97271",
        // Medium vs Mechanism
        "10.1007/978-94-011-0349-7_9"
    ],
    "toRead":[],
    // the selected papers also appear in the fringe array
    "selected":[],
    "fringe":[]
}; 