var db = firebase.database();
var DB_LOCK = false;

// player
var global_players;
var global_players_ref = db.ref("/public/players");

// pairs
var global_pairs;
var global_pairs_ref = db.ref("/public/pairs");

// Note that players is just a copy of admin/players, without player ID
var global_playersA;
var global_playersA_ref = db.ref("/admin/players");

// global queue, order of signin
var global_trueQueue;
var global_trueQueue_ref = db.ref("/admin/trueQueue");

// queues
// [0] = beg, [1] = int, [2] = adv
var global_queue;
var global_queue_ref = db.ref("/public/queue");

// current court
var global_courts;
var global_courts_ref = db.ref("/public/courts");

// additional info
var global_maxTime;
var global_maxTime_ref = db.ref("/public/maxTime");

// additional info
var global_courtCount;
var global_courtCount_ref = db.ref("/public/courtCount");

// additional info
var global_startTime;
var global_startTime_ref = db.ref("/public/startTime");

var global_hasSession = false;
var global_hasSession_ref = db.ref("/public/hasSession");

// update local data with data acquired from firebase
var public_ref = db.ref("/public");
public_ref.on('value', function(snapshot) {
    try{
    global_hasSession = snapshot.val()["hasSession"];
    console.log(global_hasSession);
    }catch(err){}
    try{
    global_startTime = snapshot.val()["startTime"];
    console.log(global_startTime);
    }catch(err){}
    try{
    global_courtCount = snapshot.val()["courtCount"];
    DB_LOCK = false;
    }catch(err){}
    try{
    global_maxTime = snapshot.val()["maxTime"];
    computeTimeParams()
    }catch(err){}
    try{
    global_courts = snapshot.val()["courts"];
    console.log(global_courts);
    DB_LOCK = false;
    }catch(err){}
    try{
    global_queue = snapshot.val()["queue"];
    DB_LOCK = false;
    }catch(err){}
    try{
    global_pairs = snapshot.val()["pairs"];
    DB_LOCK = false;
    }catch(err){}
    try{
    global_players = snapshot.val()["players"];
    DB_LOCK = false;
    }catch(err){}


    loadDefault();
});

var admin_ref = db.ref("/admin");
admin_ref.on('value', function(snapshot) {
    try{
    global_trueQueue = snapshot.val()["trueQueue"];
    DB_LOCK = false;
    }catch(err){}
    try{
    global_playersA = snapshot.val()["players"];
    DB_LOCK = false;
    }catch(err){}
    loadDefault();
});


function fb_pullHelper(refName){
  var temp = db.ref(refName);
  var result = null;
  temp.on('value', snap => {
      result = snap.val();
      //alert(result);
      //console.log(refName + " " + result);
  });
  return result;
}

function fb_pull(){

    global_hasSession = fb_pullHelper("public/hasSession");
    global_startTime = fb_pullHelper("public/startTime");
    global_courts = fb_pullHelper("public/courts");
    global_queue= fb_pullHelper("public/queue");
    global_pairs = fb_pullHelper("public/pairs");
    global_players = fb_pullHelper("public/players");
    global_playersA = fb_pullHelper("admin/playersA");
    global_trueQueue = fb_pullHelper("admin/trueQueue");
}


function loadDefault(){
    console.log("Loading default");
    console.log(global_courtCount);
    if (global_courts == undefined){
        global_courts = [];
        for (var i = 0; i < global_courtCount; i++){
            var temp = [];
            for (var j = 0; j < defaultCourtPlayerCount; j++){
                temp.push(null);
            }
            global_courts.push(temp);
        }
    } else {
        for (var i = 0; i < global_courtCount; i++){
            if (global_courts[i] == undefined){
                var temp = [];
                for (var j = 0; j < defaultCourtPlayerCount; j++){
                    temp.push(null);
                }
                global_courts[i] = temp;
            }
        }
    }

    if (global_queue == undefined){
        global_queue = [[],[],[],[]];
    } else {
        for (var i = 0; i < 4; i++){
            if (global_queue[i] == undefined){
                global_queue[i] = [];
            }
        }
    }

    if (global_pairs == undefined){
        global_pairs = [];
    }

    if (global_players == undefined){
        global_players = [];
    }

    if (global_playersA == undefined){
        global_playersA = [];
    }

    if (global_trueQueue == undefined){
        global_trueQueue = [];
    }

    if (global_hasSession == undefined){
        global_hasSession = false;
    }

    if (global_startTime == undefined){
        global_startTime = 0;
    }
    //console.log("-- Report --");
    //console.log(global_court);
    //console.log(global_queue);

    statusReport();
}

// Fill courtCount and maxTime if undefiend
function setupFirebase(){
    console.log("Reading maxTime and courtCount");
    global_maxTime_ref.once("value").then(function(snapshot) {
        if (snapshot.val() == undefined){
            console.log("maxTime is undefined");
            global_maxTime_ref.set(defaultMaxTime);
        }
    });

    global_courtCount_ref.once("value").then(function(snapshot) {
        if (snapshot.val() == undefined){
            console.log("courtCount is undefined");
            global_courtCount_ref.set(defaultCourtCount);
        }
    });
}


// Push new courts states (not timer)
function fb_push() {
    db.ref("/").update(
        {
            'public/hasSession': global_hasSession,
            'public/startTime': global_startTime,
            'public/courtCount': global_courtCount,
            'public/maxTime': global_maxTime,
            'public/courts': global_courts,
            'public/queue':global_queue,
            'admin/trueQueue': global_trueQueue,
            'public/players': global_players,
            'public/pairs': global_pairs,
            'admin/players': global_playersA
        }
    );
}

function stopSess(){
  global_hasSession = false;
  db.ref('public/hasSession').set(global_hasSession);
  //contentToHTML();
}

function cleanSess(){

    DB_LOCK = true;
    global_courts = [];
    for (var i = 0; i < global_courtCount; i++){
        var temp = [];
        for (var j = 0; j < defaultCourtPlayerCount; j++){
            temp.push(null);
        }
        global_courts.push(temp);
    }
    global_queue = [[],[],[],[]];
    global_pairs = [];
    global_players = [];
    global_playersA = [];
    global_trueQueue = [];
    global_hasSession = false;
    global_startTime = 0;

    if (DB_LOCK == false){
        alert("Databse has been modified by another admin. Refresh your webpage!");
        location.reload();
        return;
    } else {
        fb_push();
    }
}

function startSess(){
    global_startTime = (new Date()).getTime();
    global_hasSession = true;
    db.ref("/").update(
        {
            'public/hasSession': global_hasSession,
            'public/startTime': global_startTime,
        }
    );
}


function adminLogin(){
  var name = document.getElementById("adminName").value;
  var pw = document.getElementById("adminPasswd").value;

  var result = firebase.auth().signInWithEmailAndPassword(name, pw)
  .then(function(firebaseUser) {
      doAdminMode();
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      alert("Error Code: " + errorCode + "\nMessage: " + errorMessage);
    });
firebase.auth().signInWithEmailAndPassword(name, pw);

}
