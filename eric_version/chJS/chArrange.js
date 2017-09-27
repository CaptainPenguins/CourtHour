function generateTestCase(totalGroups){

    //var totalGroups = 150;

    var players = []
    for (var i = 0; i < totalGroups * 2; i++){
        var p = {id: i, name:"p" + i, lvl: Math.floor(Math.random() * 3)};
        players.push(p);
    }

    var queue = [];
    for (var i = 0; i < totalGroups; i++){
        if (Math.random() > 0.25){
            queue.push(i);
        } else {
            queue.push([i,i + 1]);
            i++;
        }
    }
    queue = shuffle(queue);
    return [players, queue];
}

function debugPrintCourts(courts, players){
    for (var i = 0; i < courts.length; i++){
        console.log("--C " + i + "---");
        var result = "";
        for (var j = 0; j < courts[i].length; j++){
            if (courts[i][j] == null){
                result += "--null--";
            } else {
                result += courts[i][j] + "(" + players[courts[i][j]]["id"] + ", " + players[courts[i][j]]["lvl"] + ") ";
            }

        }
        console.log(result);
    }
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function choosePlayers(queue, courtCount, courtCapacity){
    if (courtCapacity.length < courtCount){
        console.log("WRONG!!!!!!");
        return;
    }

    var total = 0;
    for (var i = 0; i < courtCount; i++){
        total += courtCapacity[i];
    }
    console.log("Total = " + total);
    // pray that total capacity is some even number, else, very funny?
    var selectedCount = 0;
    var selected = [];
    var originalLength = queue.length;
    for (var i = 0; (i < originalLength) && (selectedCount < total); i++){

        var cur = queue[0];
        if (Array.isArray(cur) == true){
            if (selectedCount + 2 > total){
                for (var j = selected.length - 1; j >= 0; j--){
                    if (Array.isArray(selected[j]) == false){
                        var removed = selected[j];
                        selected.splice(j, 1);
                        queue.unshift(removed);
                        break;
                    }
                }
                selected.push(cur);
                queue.shift();
                selectedCount += 1;
            } else {
                selected.push(cur);
                queue.shift();
                selectedCount += 2;
            }
        } else {

            selected.push(cur);
            queue.shift();
            selectedCount += 1;
        }
    }

    return {selected: selected, leftOver: queue};
}

function scorePair(pair, players){
    return (players[pair[0]]["lvl"] + players[pair[1]]["lvl"]) / 2;
}

function scoreCourt(court, players){
    var score = 0;
    var count = 0;
    for (var i = 0; i < court.length; i++){
        if (court[i] != null){
            count += 1;
            score += players[court[i]]["lvl"];
        }
    }

    if (count == 0){
        return -1;
    } else {
        return [score / count, count];
    }
}



function fillCourts(selectedQueue, players, courts){
    // first fill in pairs
    //console.log(selectedQueue);
    var index = 0;
    while (index < selectedQueue.length){
        if (Array.isArray(selectedQueue[index]) == false){
            index += 1;
        } else {
            var cur = selectedQueue[index];
            var pairScore = scorePair(cur, players);

            // First find save score
            var found = false;
            for (var i = 0; i < courts.length; i++){
                var courtScore = scoreCourt(courts[i], players);
                if (courtScore[0] == pairScore && courtScore[1] == 2) {
                    courts[i][2] = cur[0];
                    courts[i][3] = cur[1];
                    selectedQueue.splice(index, 1);
                    found = true;
                    break;
                }
            }

            if (found == false){
            // Then find empty ones
                for (var i = 0; i < courts.length; i++){
                    var courtScore = scoreCourt(courts[i], players);
                    if (courtScore == -1){
                        courts[i][0] = cur[0];
                        courts[i][1] = cur[1];
                        selectedQueue.splice(index, 1);
                        found = true;
                        break;
                    }
                }
            }

            if (found == false){
            // Then, whatever
                for (var i = 0; i < courts.length; i++){
                    var courtScore = scoreCourt(courts[i], players);
                    if (courtScore[1] == 2) {
                        courts[i][2] = cur[0];
                        courts[i][3] = cur[1];
                        selectedQueue.splice(index, 1);
                        found = true;
                        break;
                    }
                }
            }

            if (found == false){
                //console.log("BSAD!!!");
                //console.log(courts);
            }
            //console.log(selectedQueue);
            //console.log(index);
        }
    }

    //console.log("Finished generating for pairs");
    //console.log(courts);
    // then fill in others
    var index = 0;
    while (index < selectedQueue.length){
        if (Array.isArray(selectedQueue[index]) == false){
            var okay = false;
            for (var i = 0; i < courts.length; i++){
                var courtScore = scoreCourt(courts[i], players);
                console.log("Accessing player " + selectedQueue[index]);
                console.log("Accessing player " + index);
                console.log("Accessing player " + selectedQueue);
                console.log("Accessing player " + players);
                if (Math.round(courtScore[0]) == players[selectedQueue[index]]["lvl"] && courtScore[1] < 4) {
                    courts[i][courtScore[1]] = selectedQueue[index];
                    selectedQueue.splice(index, 1);
                    okay = true;
                    break;
                } else if (courtScore == -1){
                    courts[i][0] = selectedQueue[index];
                    selectedQueue.splice(index, 1);
                    okay = true;
                    break;
                }
            }
            if (okay == false){
                index += 1;
            }
        }
    }

    //console.log("Finished round 1 pairing of singles");
    //console.log(courts);
    var index = 0;
    //console.log("Sub optimal pairing " + selectedQueue.length);
    while (index < selectedQueue.length){
        if (Array.isArray(selectedQueue[index]) == false){
            for (var i = 0; i < courts.length; i++){
                var courtScore = scoreCourt(courts[i], players);
                if (courtScore[1] < 4) {
                    courts[i][courtScore[1]] = selectedQueue[index];
                    selectedQueue.splice(index, 1);
                    break;
                }
            }
        }
    }

    return courts;
}


function generateCourts(courtCount, courtCapacity){
    var result = [];
    for (var i = 0; i < courtCount; i++){
        var temp = [];
        for (var j = 0; j < courtCapacity[i]; j++){
            temp.push(null);
        }
        result.push(temp);
    }
    return result;
}

function generateInfo(selected, leftOver, players){
    // We first separate leftOver into multiple queues
    var dispQueue = [[],[],[],[]];
    for (var i = 0; i < leftOver.length; i++){
        if (Array.isArray(leftOver[i]) == true){
            dispQueue[3].push(leftOver[i]);
        } else {
            dispQueue[players[leftOver[i]]["lvl"]].push(leftOver[i]);
        }
    }

    var shuffledSelected = shuffle(selected);
    var newQueue = leftOver.concat(shuffledSelected);

    console.log(leftOver.length);
    console.log(newQueue.length);
    return {trueQueue: newQueue, dispQueue: dispQueue};
}


function scheduler(queue, players, courtCount, courtCapacity){
    var queueBackup = JSON.parse(JSON.stringify(queue));

    var result = choosePlayers(queue, courtCount, courtCapacity);
    console.log(result);
    var selectedBackup = JSON.parse(JSON.stringify(result["selected"]));

    var courts = generateCourts(courtCount, courtCapacity);
    var filledCourts = fillCourts(result["selected"], players, courts);
    //console.log(filledCourts);
    debugPrintCourts(filledCourts,players, courts);

    var vals = generateInfo(selectedBackup, result["leftOver"], players);
    return {courts: filledCourts, trueQueue: vals["trueQueue"], dispQueue: vals["dispQueue"]};
}


function tester(){
    var t_courtCount = 4;
    var t_courtCapacity = [4,4,4,4];
    var t_tc = generateTestCase(25);
    console.log(t_tc[0]);
    console.log(t_tc[1]);

    var result = scheduler(t_tc[1], t_tc[0], t_courtCount, t_courtCapacity);
    console.log(result);
}


// ---- Arrange a session according to available information
function arrangeSess(){

    DB_LOCK = true;

    var capacity = [];
    for (var i = 0 ; i < global_courtCount; i++){
        capacity.push(4);
    }

    console.log(global_playersA);
    console.log(global_trueQueue);
    console.log(global_courtCount);
    console.log(capacity);

    var result = scheduler(global_trueQueue, global_players, global_courtCount, capacity);
    console.log(result);

    global_trueQueue = result["trueQueue"];
    global_queue = result["dispQueue"];
    global_courts = result["courts"];

    if (DB_LOCK == false){
        alert("Databse has been modified by another admin. Refresh your webpage!");
        location.reload();
        return;
    } else {
        fb_push();
    }
}



// ----- Additional Manipulations -----
function removeFromAllPlaces(index){
    console.log("Removing from " + global_courts);
    for (var i = 0; i < global_courts.length; i++){
        for (var j = 0; j < global_courts[i].length; j++){
            if (global_courts[i][j] == index){
                global_courts[i][j] = null;
                return "court";
            }
        }
    }

    console.log("Removing from " + global_queue);
    for (var i = 0; i < 3; i++){
        console.log(i+"-.");
        for (var j = 0; j < global_queue[i].length; j++){
            console.log(global_queue[i]);
            if (global_queue[i][j] == index){
                global_queue[i].splice(j, 1);
                console.log("Removing " +j);
                console.log(global_queue[i]);
                return "queue";
            }
        }
    }

    for (var i = 0; i < global_queue[3].length; i++){
        if (global_queue[3][i][0] == index){
            var partner = global_queue[3][i][1];
            global_queue[3].splice(i, 1);
            return ["pair", partner];
        } else if (global_queue[3][i][1] == index){
            var partner = global_queue[3][i][0];
            global_queue[3].splice(i, 1);
            return ["pair", partner];
        }
    }

    return "not found";
}

function removeFromTrueQueue(index){
    //console.log("here");
    //console.log(global_trueQueue);
    //console.log(global_trueQueue.length);
    for (var i = 0; i < global_trueQueue.length; i++){
        if (Array.isArray(global_trueQueue[i]) == true){
            if (global_trueQueue[i][0] == index || global_trueQueue[i][1] == index){
                global_trueQueue.splice(i, 1);
            }
        } else if (global_trueQueue[i] == index){
            global_trueQueue.splice(i, 1);
            //console.log("here2");
        }
    }

    for (var i = 0; i < global_pairs.length; i++){
        if (global_pairs[i][0] == index){
            var partner = global_pairs[i][1];
            global_pairs.splice(i, 1);
            //return ["pairAll", partner];
        } else if (global_pairs[i][1] == index){
            var partner = global_pairs[i][0];
            global_pairs.splice(i, 1);
            //return ["pairAll", partner];
        }
    }
}


function shiftIndex(index){
    for (var i = 0; i < global_courts.length; i++){
        for (var j = 0; j < global_courts[i].length; j++){
            if (global_courts[i][j] > index){
                global_courts[i][j] -= 1;
            }
        }
    }

    for (var i = 0; i < 3; i++){
        for (var j = 0; j < global_queue[i].length; j++){
            if (global_queue[i][j] > index){
                global_queue[i][j] -= 1;
            }
        }
    }

    for (var i = 0; i < global_queue[3].length; i++){
        if (global_queue[3][i][0] > index){
            global_queue[3][i][0] -= 1;
        }
        if (global_queue[3][i][1] > index){
            global_queue[3][i][1] -= 1;
        }
    }

    for (var i = 0; i < global_pairs.length; i++){
        if (global_pairs[i][0] > index){
            global_pairs[i][0] -= 1;
        }
        if (global_pairs[i][1] > index){
            global_pairs[i][1] -= 1;
        }
    }

    for (var i = 0; i < global_trueQueue.length; i++){
        if (Array.isArray(global_trueQueue[i]) == true){
            if (global_trueQueue[i][0] > index){
                global_trueQueue[i][0] -= 1;
            }
            if (global_trueQueue[i][1] > index){
                global_trueQueue[i][1] -= 1;
            }
        } else if (global_trueQueue[i] > index){
            global_trueQueue[i] -= 1;
        }
    }

}


function removeFromTruth(index, pairResult){

    if (pairResult != null){
        alert("Your partner " + global_players[pairResult]["name"] + " will be removed too");
        removeFromAllPlaces(pairResult);
        removeFromTrueQueue(pairResult);
    }

    // Now we are safe to remove player at index from
    shiftIndex(index);
    global_players.splice(index, 1);
    global_playersA.splice(index, 1);

    if (pairResult > index){
        pairResult -= 1;
    }

    shiftIndex(pairResult);
    global_players.splice(pairResult, 1);
    global_playersA.splice(pairResult, 1);
}
