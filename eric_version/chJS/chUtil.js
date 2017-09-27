// Default Values
var defaultCourtPlayerCount = 4;
var defaultCourtCount = 6;
var defaultMaxTime = 15;

// Timer limit -> color
var maxTime;
var orangeLimit;
var redLimit;


var displayArea = {
    start: function() {
        this.interval = setInterval(updateHTML, 1000);
    },
    stop: function() {
        clearInterval(this.interval);
    },
}

var onlineChecker = {
    start: function() {
        this.interval = setInterval(checkOnlineStatus, 10000);
    },
    stop: function() {
        clearInterval(this.interval);
    },
}


var fbUser = undefined;
var browser_mobile = false;

function startSystem() {
    /*var p = [{name: "eric", lvl:2},
                {name: "philip", lvl:1},
                {name: "justin", lvl:0}];
    db.ref('public/players').set(p);

    var p = [{name: "eric", id:123456, lvl:2},
                {name: "philip", id:123457, lvl:1},
                {name: "justin", id:123458, lvl:0}];
    db.ref('admin/players').set(p);*/

    fbUser = firebase.auth().currentUser;
    setupFirebase();
    //console.log(fbUser);
    fb_pull();
    var isMobile = {
        Android: function() {
            return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function() {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function() {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function() {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows: function() {
            return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
        },
        any: function() {
            return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
        }
    };

    if (isMobile.any()) {
        browser_mobile = true;
    }

    if (browser_mobile) {
        document.getElementById("hint").style.marginTop = "0em";
    }

    displayArea.start();
    onlineChecker.start();

}


/*
function startSystem(){

    var p = [{name: "eric", id:123456, lvl:"beg"},
                {name: "philip", id:123457, lvl:"int"},
                {name: "justin", id:123458, lvl:"adv"}];
    db.ref('public/players').set(p);

    setupFirebase();
}*/


function statusReport() {
    //return;
    console.log("--Status Report--");
    console.log(global_players);
    console.log(global_playersA);
    console.log(global_trueQueue);
    console.log(global_queue);
    console.log(global_courts);
    console.log(global_hasSession);
    console.log(global_startTime);
    console.log("--End Report--");
    //console.log(global_adv);
    //console.log(global_court);
    //console.log(global_courtLvl);
}


// ---- Player Related ----

function getColor(lvl) {
    if (lvl == 0) {
        return "green";
    } else if (lvl == 1) {
        return "orange";
    } else if (lvl == 2) {
        return "red";
    } else {
        return "black";
    }
}

function fontProp(t, v) {
    return "<font " + t + "=\"" + v + "\"> ";
}

function playerClickAble(id, name) {
    //console.log("Clickable " + id);
    if (id != undefined) {
        return "<a id=\"" + "playerDisplay_" + id +
            "\" onmouseover=\"playerTextCursor(" + id +
            ")\" onclick=\"playerClick('" + name + "'," + id + ")\">"
    } else {
        return "<a>";
    }
}

function playerShowID(id) {
    if (id != undefined) {
        return "<font size=\"-2\">(" + id + ")</font>";
    } else {
        return "";
    }
}

function playerTextCursor(id) {
    console.log("Mouse over " + "playerDisplay_" + id);
    document.getElementById("playerDisplay_" + id).style.cursor = "pointer";
}

function playerClick(name, id) {
    document.getElementById("rPlayerName").value = name;
    document.getElementById("rPlayerID").value = id;
    document.getElementById("playerPair").value = name;
}

// input: index, index of player in global_players array
function dispPlayer(index) {

    var player;
    if (global_players == undefined || index > global_players.length || global_players[index] == undefined) {
        player = {
            name: "--",
            lvl: undefined
        }
    } else {
        if (index >= global_playersA.length){
            player = global_players[index];
        } else {
            player = global_playersA[index];
        }

        //.log(player);
    }

    var name = player["name"];
    var id = player["id"];
    var lvl = player["lvl"];

    //console.log(name + id + lvl);

    var fontSize = (player["name"].length < 10) ? "+3" : "+2";
    var result = fontProp("size", fontSize) + fontProp("color", getColor(lvl)) +
        playerClickAble(id, name) + name + playerShowID(id) + "</a></font></font>";
    //console.log(result);
    return result;
}

function dispArray(array){
    var result = "";
    for (var i = 0; i < array.length; i++){
        if (Array.isArray(array[i])){
            result += fontProp("size", "+2") + "(</font>" + dispPlayer(array[i][0]) + fontProp("size", "+2") + "<-></font>" + dispPlayer(array[i][1]) + fontProp("size", "+2") + ")</font>";
        } else {
            result += dispPlayer(array[i]);
        }
        if (i != array.length - 1){
            result += ",  ";
        }
    }
    if (result == ""){
        return fontProp("size", 2) + "--" + "</font>";
    }
    return result;
}

// Return index in global player list
function searchPlayer(option, key){
    if (option != "id" && option != "name") {alert("NOT A VALID SEARCH OPTION");}
    for (var i = 0; i < global_playersA.length; i++){
        if (option == "id"){
            if (global_playersA[i]["id"] == key){
                return i;
            }
        } else if (option == "name"){
            if (global_playersA[i]["name"] == key){
                return i;
            }
        }
    }
    return -1;
}

// Return position in global pairs list
function searchPair(option, key){
    if (option != "id" && option != "name") {alert("NOT A VALID SEARCH OPTION");}
    for (var i = 0; i < global_pairs.length; i++){
        if (option == "id"){
            if (global_playersA[global_pairs[i][0]]["id"] == key){
                return [i, 0, 1];
            } else if (global_playersA[global_pairs[i][1]]["id"] == key){
                return [i, 1, 0];
            }
        } else if (option == "name"){
            if (global_playersA[global_pairs[i][0]]["name"] == key){
                return [i, 0, 1];
            } else if (global_playersA[global_pairs[i][1]]["name"] == key){
                return [i, 1, 0];
            }
        }
    }
    return null;
}



function addPlayerHelper(id, name, lvl, pairName){
    DB_LOCK = true;

    //loadDefault();
    statusReport();

    var player = {lvl: lvl, name: name};
    //console.log("p " + player);
    //console.log("p " + global_players.length);
    global_players.push(player);
    //console.log("p " + global_players.length);
    var playerA = {id: id, name: name, lvl: lvl};
    global_playersA.push(playerA);

    //console.log("p " );
    //console.log(playerA);
    if (pairName != ""){
        var pairIndex = searchPlayer("name", pairName);
        console.log("Pair index is " + pairIndex);
        console.log(removeFromAllPlaces(pairIndex));
        removeFromTrueQueue(pairIndex);
        var pair = [global_playersA.length - 1, pairIndex];
        global_trueQueue.push(pair);
        global_pairs.push(pair);
        global_queue[3].push(pair);
    } else {
        global_trueQueue.push(global_playersA.length - 1);
        global_queue[lvl].push(global_playersA.length - 1);
    }

    statusReport();

    if (DB_LOCK == false){
        alert("Databse has been modified by another admin. Refresh your webpage!");
        location.reload();
        return;
    } else {
        fb_push();
        console.log("Pushed");
    }
}



// ---- Time/Date Related ------
function computeTimeParams() {
    maxTime = global_maxTime * 60 * 1000;
    orangeLimit = maxTime * 0.3;
    redLimit = maxTime * 0.1;
}


function formatDate(date) {

    var minute = date.getMinutes();
    var second = date.getSeconds();

    if (minute < 10) {
        minute = "0" + minute;
    }

    if (second < 10) {
        second = "0" + second;
    }

    return minute + ':' + second;
    // Don't worry about this, for debugging only
    // return date.getYear() + ':' + date.getMonth() + ':' +date.getDay() + ':' +minute + ':' + second;
}
