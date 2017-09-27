




document.getElementById("sticky_div").onclick = function() {
    //console.log("User moused down");

    if (timerExpanded) {
        document.getElementById("sticky_div").style.width = "25px";
        document.getElementById("sticky_content").style.width = "25px";
        document.getElementById("sticky_content").setAttribute("style", "visibility:hidden");
        timerExpanded = false;
    } else {
        document.getElementById("sticky_div").style.width = "auto";
        document.getElementById("sticky_content").style.width = "auto";
        document.getElementById("sticky_content").setAttribute("style", "visibility:visible");
        timerExpanded = true;
    }

    return true; // Not needed, as long as you don't return false
};



    // ---- Arrange a session according to available information
    function arrangeSess(){
      fb_pull();

      result = updateState(global_beg, global_int, global_adv, global_court, global_courtLvl);
      global_beg = result["beg"];
      global_int = result["int"];
      global_adv = result["adv"];
      global_court = result["court"];
      global_courtLvl = result["courtLvl"];

      fb_push();
      contentToHTML();
    }

    function startSess(){
      global_startTime = new Date();
      db.ref('public/last_rotation_start_time').set(global_startTime.getTime());

      global_hasSession = true;
      db.ref('public/session_running').set(global_hasSession);

      contentToHTML();
    }

    function cleanFB(){
      global_beg = [];
      global_int = [];
      global_adv = [];
      global_pairs = [];
      global_allID = [];
      global_allName = [];
      for (var i = 0; i < allCourts; i++){
        global_court[i] = [null,null,null,null];
      }
      for (var i = 0; i < allCourts; i++){
        global_courtLvl[i] = [null,null,null,null];
      }

      fb_push();
      stopSess();
    }



    function getBracketID(name){
        var i = global_allName.indexOf(name);
        if (i != -1){
            var id = global_allID[i];
            var temp = "<a id=\"" + "queue_" + id + "\" onmouseover=\"arrayTextCursor(" + id + ")\" onclick=\"arrayNameClick('" + name + "'," + id + ")\">" + name + "<font size=\"-2\">(" + id + ")</font></a>";
            return temp;
        }
        return name;
    }



    function arrayToText(arr){
        var result = "";
        for (var i = 0; i < arr.length - 1; i++){
            result = result + getBracketID(arr[i]) + ",  ";
        }
        result = result + getBracketID(arr[i]);
        return result;
    }

    function pairArrayToText(arr){
      var result = "";
      for (var i = 0; i < arr.length - 1; i++){
          result = result + getBracketID(arr[i][0]) + "<->" + getBracketID(arr[i][2]) + ",  ";
      }
      result = result + getBracketID(arr[i][0]) + "<->" + getBracketID(arr[i][2]);
      return result;
    }

    function arrayNameClick(name, id){
      document.getElementById("rPlayerName").value = name;
      document.getElementById("rPlayerID").value = id;
      document.getElementById("playerPair").value = name;
    }

    function nameClick(courtID, indexOnCourt){
      //console.log("Clicked " + courtID + " " + indexOnCourt);
      var name = global_court[courtID][indexOnCourt];
      var index = global_allName.indexOf(name);
      if (index == -1){
        return;
      }
      var id = global_allID[index];
      //console.log("info " + name + " " + id);

      document.getElementById("rPlayerName").value = name;
      document.getElementById("rPlayerID").value = id;
      document.getElementById("playerPair").value = name;
    }

    function contentToHTML(){
      for (var i = 0; i < allCourts; i++){
        for (var j = 0; j < 4; j++){
            var tableID = "cur_" + i.toString() + "_" + j;
            //console.log("Finding ID " + tableID);
            var result = global_court[i][j];
            var lvlResult = global_courtLvl[i][j];
            if (result == undefined){
              result = "--"
            }
            if (lvlResult == undefined){
              lvlResult = "black";
            } else if (lvlResult == "beg"){
              lvlResult = "green";
            } else if (lvlResult == "int"){
              lvlResult = "orange";
            } else if (lvlResult == "adv"){
              lvlResult = "red";
            }
            if (result.length > 10){
                document.getElementById(tableID).innerHTML = "<font size=\"+1\">" + getBracketID(result) + "</font>";
            } else {
                document.getElementById(tableID).innerHTML = "<font size=\"+2\">" + getBracketID(result) + "</font>";
            }

            document.getElementById(tableID).style.color = lvlResult;
        }
      }

      document.getElementById("begQueue").innerHTML = global_beg.length == 0 ? "--" : "<font size=\"+3\">" + arrayToText(global_beg) + "</font>";
      document.getElementById("intQueue").innerHTML = global_int.length == 0 ? "--" : "<font size=\"+3\">" + arrayToText(global_int) + "</font>";
      document.getElementById("advQueue").innerHTML = global_adv.length == 0 ? "--" : "<font size=\"+3\">" + arrayToText(global_adv) + "</font>";
      document.getElementById("allIDs").innerHTML = global_allID.length == 0 ? "--" : "<font size=\"+1\">" + arrayToText(global_allID) + "</font>";
      document.getElementById("allPairs").innerHTML = global_pairs.length == 0 ? "--" : "<font size=\"+1\">" + pairArrayToText(global_pairs) + "</font>";
    }

    


    // search through everything to find this player :D
    function removeHelper(name){

      // we break up pairs if the player we trying to remove is paired up
      for (var i = 0; i < global_pairs.length; i++){
        if (name == global_pairs[i][0] || name == global_pairs[i][1]){
          global_pairs.splice(i, 1);
          alert("Pair " + global_pairs[i][0] + "(" + global_pairs[i][1] + ")<->" + global_pairs[i][2] + "(" + global_pairs[i][3] + ") will be broken up");
        }
      }

      document.getElementById("rPlayerName").value = "";
      document.getElementById("rPlayerID").value = "";
      document.getElementById("nameSug").style.visibility = "hidden";
      fb_push();
      return;
    }

    function removePlayer(){
      var name = document.getElementById("rPlayerName").value;
      var id = document.getElementById("rPlayerID").value;

      if (id != "none"){
          var index = global_allID.indexOf(id);
          if (index == -1){
              alert("Player ID " + id + " is not playing right now.");
              return;
          }
          if (global_allName[index] != name){
              alert("Player " + name + " does not match with provided name in our system.");
              return;
          }
          global_allID.splice(index, 1);
          global_allName.splice(index, 1);
      }

      for (var i = 0; i < global_beg.length; i++){
        if (global_beg[i] == name){
          global_beg.splice(i, 1);
          removeHelper(name);
          return;
        }
      }

      for (var i = 0; i < global_int.length; i++){
        if (global_int[i] == name){
          global_int.splice(i, 1);
          removeHelper(name);
          return;
        }
      }

      for (var i = 0; i < global_adv.length; i++){
        if (global_adv[i] == name){
          global_adv.splice(i, 1);
          removeHelper(name);
          return;
        }
      }

      for (var i = 0; i < global_court.length; i++){
        for (var j = 0; j < global_court[i].length; j++){
          if (global_court[i][j] == name){
            delete global_court[i][j];
            delete global_courtLvl[i][j];
            removeHelper(name);
            return;
          }
        }
      }

      removeHelper("none");
      alert("Cannot find such player");
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

    function adminLogin(){
      var name = document.getElementById("adminName").value;
      var pw = document.getElementById("adminPasswd").value;

      var result = firebase.auth().signInWithEmailAndPassword(name, pw)
      .then(function(firebaseUser) {
          fb_pull();
          doAdminMode();
        }).catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          alert("Error Code: " + errorCode + "\nMessage: " + errorMessage);
        });
    firebase.auth().signInWithEmailAndPassword(name, pw);

    }

    var showLogin = false;
    function showAdmin(){
      if (showLogin == false){
        document.getElementById("adminLoginDiv").style.visibility = "visible";
        document.getElementById("addPlayerDiv").style.visibility = "hidden";
        document.getElementById("removePlayerDiv").style.visibility = "hidden";
        document.getElementById("controlDiv").style.visibility = "hidden";
        showLogin = true;
      } else {
        document.getElementById("adminLoginDiv").style.visibility = "hidden";
        document.getElementById("addPlayerDiv").style.visibility = "hidden";
        document.getElementById("removePlayerDiv").style.visibility = "hidden";
        document.getElementById("controlDiv").style.visibility = "hidden";
        showLogin = false;
      }
    }

    function showAdmin1(){
        document.getElementById("adminLoginDiv").style.visibility = "visible";
        document.getElementById("addPlayerDiv").style.visibility = "visible";
        document.getElementById("removePlayerDiv").style.visibility = "visible";
        document.getElementById("controlDiv").style.visibility = "visible";
    }

    function fb_authenticate(){
        var provider = new firebase.auth.GoogleAuthProvider();

        firebase.auth().getRedirectResult().then(function(result) {
          if (result.credential) {
            // This gives you a Google Access Token. You can use it to access the Google API.
            var token = result.credential.accessToken;
            console.log("Successful login");
            doAdminMode();
          }
          console.log("hmm?");
          //doAdminMode();
          // The signed-in user info.
          var user = result.user;
        }).catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // The email of the user's account used.
          var email = error.email;
          // The firebase.auth.AuthCredential type that was used.
          var credential = error.credential;
          // ...
        });

        firebase.auth().signInWithRedirect(provider);
        // Log user in anonymously
        //authClient.login("anonymous");
    }













    function fb_pullHelper(refName) {
        var temp = db.ref(refName);
        var result = null;
        temp.on('value', snap => {
            result = snap.val();
            //alert(result);
            //console.log(refName + " " + result);
        });
        return result;
    }
