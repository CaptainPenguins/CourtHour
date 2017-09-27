All arrays, if not specified, represents play as index in global_playersA

Input
global_trueQueue: order that people signed in, array of a combination of int and length=2 array (for a pair)
global_playersA: an array of players {id, name, lvl}

Output
1. a "rotated" global_trueQueue
2. global_queue: an array of queues at each level and pairs
3. global_courts: array with players assigned to courts

Rules (in order of importance)
1. pairs must stay on the same court
2. order that players signed up/waited in the queue should be respected to the best possible way
3. players on the same court should be
	a. all of them are the same level
	b. if cannot be achieved, approximately the same level
4. randomize order of players who have finished a session 