var courtCountDefined = false;

window.addEventListener('offline', updateOfflineStatus);
function updateOfflineStatus()
{
    alert("You are offline! Re-connect to internet for latest data.");
    var div= document.createElement("div");
    div.className += "overlay";
    div.innerHTML = "You are offline! Re-connect to internet for latest data. Your current page has been disabled to prevent reading/writing incorrect data.";
    document.body.appendChild(div);
}

function checkOnlineStatus(){
    if (navigator.onLine == false){
        updateOfflineStatus();
    }
}

function updateHTML(){
    // in case data is not complete
    //loadDefault();
    if (courtCountDefined == false){
        if (courtCountDefined == false){
            for (var i = 0; i < global_courtCount; i++){
                addCourt(i, browser_mobile);
            }
        }
        courtCountDefined = true;
    }

    updateTimer();
    updateCourts();
    updateQueue();
}


// Only add court once
function addCourt(index, mobile) {
    var courtDiv = document.createElement("div");
    courtDiv.id = "courtSubDiv" + index.toString();
    if (mobile == false) {
        courtDiv.className = "4u$ 12$(medium)";
    } else {
        courtDiv.className = "12u$ 12$(medium)";
    }

    courtDiv.innerHTML = "<strong>Court " + (index + 1).toString() + "</strong>";
    document.getElementById("courtsDiv").appendChild(courtDiv);

    // Create cur player table
    var curTable = document.createElement('table');
    var row1 = curTable.insertRow(0);
    var row2 = curTable.insertRow(1);
    var row1col1 = row1.insertCell(0);
    row1col1.id = "cur_" + index.toString() + "_0";
    row1col1.innerHTML = 'Player 1';

    var row1col2 = row1.insertCell(1);
    row1col2.id = "cur_" + index.toString() + "_1";
    row1col2.innerHTML = 'Player 2';

    var row2col1 = row2.insertCell(0);
    row2col1.id = "cur_" + index.toString() + "_2";
    row2col1.innerHTML = 'Player 3';

    var row2col2 = row2.insertCell(1);
    row2col2.id = "cur_" + index.toString() + "_3";
    row2col2.innerHTML = 'Player 4';

    courtDiv.appendChild(curTable);
}


function updateCourts() {

    console.log("Printing courts");
    console.log(global_courts);
    for (var i = 0; i < global_courts.length; i++) {

        for (var j = 0; j < defaultCourtPlayerCount; j++) {
            var tableID = "cur_" + i.toString() + "_" + j;
            //console.log("Finding ID " + tableID);
            var playerIndex = global_courts[i][j];
            //console.log(playerIndex);
            document.getElementById(tableID).innerHTML = dispPlayer(playerIndex)
        }
    }
}


function updateTimer(){

    if (global_hasSession) {
        var curTime = Date.now();
        var remainTime = maxTime - (curTime - global_startTime);
        curTime = new Date(remainTime);
        console.log("---");
        console.log(global_startTime);
        console.log(curTime);
        console.log(maxTime);
        console.log(remainTime);
        console.log("###");
        var color = color = "#333";;
        if (remainTime < 0) {
            stopSess();
        } else if (remainTime < redLimit) {
            color = "red";
        } else if (remainTime < orangeLimit) {
            color = "orange";
        }

        document.getElementById("sticky_div").style.backgroundColor = color;
        document.getElementById("sess_header").style.color = color;
        document.getElementById("sess_timer1").style.color = color;
        document.getElementById("sess_timer1").innerHTML = formatDate(curTime);
        document.getElementById("sess_timer2").innerHTML = formatDate(curTime);
    } else {

        document.getElementById("sticky_div").style.backgroundColor = "#333";
        document.getElementById("sess_header").style.color = "#333";
        document.getElementById("sess_timer1").style.color = "#333";
        document.getElementById("sess_timer1").innerHTML = "--";
        document.getElementById("sess_timer2").innerHTML = "--";
    }

    if (browser_mobile) {
        document.getElementById("sticky_div").style.top = "5%";
    } else {
        document.getElementById("sticky_div").style.top = "12.5%";
    }
}

function updateQueue(){
    document.getElementById("begQueue").innerHTML = dispArray(global_queue[0]);
    document.getElementById("intQueue").innerHTML = dispArray(global_queue[1]);
    document.getElementById("advQueue").innerHTML = dispArray(global_queue[2]);
    document.getElementById("pairQueue").innerHTML = dispArray(global_queue[3]);

    document.getElementById("trueQueue").innerHTML = dispArray(global_trueQueue);
    document.getElementById("allPairs").innerHTML = dispArray(global_pairs);
}


// ----- Clean all text boxes ----
function cleanTextBoxes(){
    document.getElementById("playerName").value = "";
    document.getElementById("playerID").value = "";
    document.getElementById("playerPair").value = "";

    document.getElementById("rPlayerName").value = "";
    document.getElementById("rPlayerID").value = "";

    document.getElementById("nameSug").innerHTML = "";
    document.getElementById("nameSug").style.height = "0px";
    document.getElementById("nameSug").style.visibility = "hidden";
}


// ------- Name Suggestion ----------
var sugState = 1;
function getNameSuggestion(state){

    sugState = state;
    if (sugState == 1){
        var id = document.getElementById("playerID").value;
    } else {
        var id = document.getElementById("rPlayerID").value;
    }


    if ( id != ""){
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                //console.log(this.responseText);
                document.getElementById("nameSug").innerHTML = this.responseText;
                document.getElementById("nameSug").style.height = "auto";
                document.getElementById("nameSug").style.visibility = "visible";
            }
        };

        // okay to have slow suggesiton
        xmlhttp.open("GET", "nameSuggestion.php?id=" + id, true);
        xmlhttp.send();
    } else {
        document.getElementById("nameSug").innerHTML = "";
        document.getElementById("nameSug").style.height = "0px";
        document.getElementById("nameSug").style.visibility = "hidden";
    }
}

function chooseSug(index){
    //console.log("suggestion " + $index);
    //console.log(document.getElementById("sug_" + $index).value);

    if (sugState == 1){
        document.getElementById("playerName").value = document.getElementById("sug_" + index).innerHTML;
    } else {
        document.getElementById("rPlayerName").value = document.getElementById("sug_" + index).innerHTML;
    }
}


// ----------- Add Player -------
function addPlayer() {
    var name = document.getElementById("playerName").value;
    var id = document.getElementById("playerID").value;
    var lvl = document.getElementById("playerLevel").selectedIndex;
    var pair = document.getElementById("playerPair").value;

    if (name == "" || id == "") {
        alert("BAD name/id");
        return;
    }

    // Verify that ID exists on our data base
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // do nothing because our thing is synchonous
        }
    };

    // okay to have slow suggesiton
    xmlhttp.open("GET", "verifyID.php?id=" + id, false);
    xmlhttp.send();

    //console.log("response is " + xmlhttp.responseText);
    // TODO re-enable this check
    /*if (xmlhttp.responseText != "true") {
        alert("ID " + id + " does not exist!");
        return;
    }*/

    if (searchPlayer("id", id) != -1){
        alert("Player with ID " + id + " has already signed in!");
        return;
    } else if (searchPlayer("name", name) != -1){
        alert("Player with name " + name + " has already been used!");
        return;
    }

    var searchPairResult = searchPair("name", pair);
    if (pair != ""){
        if (searchPlayer("name", pair) == -1){
            alert("Cannot find your pair whose name is " + pair);
            return;
        } else if (searchPairResult != null){
            console.log(searchPairResult);
            var partner = global_players[global_pairs[searchPairResult[0]][searchPairResult[2]]]["name"];
            alert("Your pair " + pair + " is already paird up with " + partner);
            return;
        }
    }

    addPlayerHelper(id, name , lvl, pair);
    cleanTextBoxes();
}



// ------ Remove Player -----
function removePlayer(){
  var name = document.getElementById("rPlayerName").value;
  var id = document.getElementById("rPlayerID").value;

  var idResult = searchPlayer("id", id);
  var nameResult = searchPlayer("name", name);
  if (id != "" && name != ""){
      if (searchPlayer("id", id) == -1){
          alert("Player ID " + id + " is not playing right now.");
          return;
      }
      if (searchPlayer("name", name) == -1){
          alert("Player " + name + " does not match with provided name in our system.");
          return;
      }
      if (idResult != nameResult){
          alert("Database inconsistency! Check with webadmin for Firebase access");
          return;
      }
  } else {
      alert("Please provide appropriate ID and name");
      return;
  }

  var pairResult = searchPair("id", global_playersA[idResult]["id"]);
  if (pairResult != null){
      pairResult = global_pairs[pairResult[0]][pairResult[2]];
  }

  DB_LOCK = true;
  removeFromAllPlaces(idResult);
  removeFromTrueQueue(idResult);
  removeFromTruth(idResult, pairResult);

  if (DB_LOCK == false){
      alert("Databse has been modified by another admin. Refresh your webpage!");
      location.reload();
      return;
  } else {
      fb_push();
  }

  cleanTextBoxes();
}




function doAdminMode(){
    document.getElementById("adminLoginDiv").style.visibility = "hidden";
    document.getElementById("adminLoginDiv").style.height = "0px";
    document.getElementById("addPlayerDiv").style.visibility = "visible";
    document.getElementById("removePlayerDiv").style.visibility = "visible";
    document.getElementById("controlDiv").style.visibility = "visible";
    document.getElementById("moreInfoDiv").style.visibility = "visible";

    document.getElementById("addPlayerDiv").style.height = "auto";
    document.getElementById("removePlayerDiv").style.height = "auto";
    document.getElementById("controlDiv").style.height = "auto";
    document.getElementById("moreInfoDiv").style.height = "auto";

    document.getElementById("icon1").style.visibility = "hidden";
}
