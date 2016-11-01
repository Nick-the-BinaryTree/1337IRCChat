var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var users = [];
var stockNames = ["Neo", "Chad", "Charmander", "Squirtle", "Bulbasaur", "The Chosen One", "Rex", "1337", "LeetLarry", "Splicer", "Ghost", "Sandwich", "Iceman", "Zombie", "Bane", "Death Star", "Shadow", "Toxic", "Mr. Green", "Zero", "Kingpin", "Plague", "Donald Trump"];
var help = [
    "/clear -> clears chat",
    "/help -> brings you here",
    "/hex [username] -> converts a user's output to hexidecimal",
    "/list -> lists users online",
    "/name [new_name] -> changes your nickname to a new value",
    "\\ -> (forward slash) switches to a drawing canvas and back (space clears canvas)"
];
var bit_history = [];

app.use(express.static(__dirname+'/public'));

http.listen(3000, function(){
	console.log('listening on *:3000');
});

io.on('connection', function(socket){ //First connection and disconnect
        var name = userGen();
        users.push({"id" : socket.id, "name" : name, "hex" : false});
        console.log('Connected: ' + socket.id + " | " + name);
        socket.on('disconnect', function(){
                var userIndex = userSearch(socket.id, "id");
                console.log('Disconnected: ' + socket.id + " | " + name);
                users.splice(userIndex, 1);
        });
        
        for (var i in bit_history){
            socket.emit('draw_bit', bit_history[i]);
        }
});

io.on('connection', function(socket){
	socket.on('chat message', function(msg){
        var userIndex = userSearch(socket.id, "id");
        var name = users[userIndex].name;
		console.log(name + ': ' + msg);
        parseMsg(socket.id, name, msg);
	});
    
    socket.on('draw_bit', function(bit){
        bit_history.push(bit);
        io.emit('draw_bit', bit);
    });
    
    socket.on('clearD', function(){
        console.log("clearing drawings");
        //line_history = [];
        bit_history = [];
        io.emit('clearD');
    });
});

function userSearch(tar, type){
    for(var x = 0; x < users.length; x++){
        if(tar === users[x][type]){
            return x;
        }
    }
    return -1;
}
    
function userGen(){
    
    var rand = Math.random() * 2;
    var name = "";
    
    if(rand <= 1){
        name = "Anon" + Math.floor(Math.random()*1000);
    }
    else{
        var randStock = Math.floor(Math.random()*stockNames.length);
        name = stockNames[randStock];
    }
    
    for(var x = 0; x < users.length; x++){
        if(name === users[x].name){
            return userGen();
        }
    }
    return name;
}

function parseMsg(id, name, msg){
    
    var words = msg.split(' ');
    if(words[0] !== 'undefined'){
        if(words[0] === "/name"){
            if(typeof words[1] !== 'undefined'){
                setName(id, words[1]);
            }
        }
        else if(words[0] === "/help"){
            io.sockets.connected[id].emit('help message', help);
        }
        else if(words[0] === "/hex"){
            if(typeof words[1] !== 'undefined'){
                setHex(words[1]);
            }
        }
        else if(words[0] === "/list"){
            io.sockets.connected[id].emit('list message', getNameList());
        }
        else if(words[0] === "/clear"){
            io.sockets.connected[id].emit('clear message', getNameList());
        }
        else{
            if(users[userSearch(id, "id")].hex){
                io.emit('chat message', {"name" : name, "msg" : hex(msg)});
            }
            else{
                io.emit('chat message', {"name" : name, "msg" : msg});

            }
        }
    }
}

function getNameList(){
    var list = [];
    
    for(var x = 0; x < users.length; x++){
        list.push(users[x].name);
    }
    
    return list;
}

function setName(id, name){
    users[userSearch(id, "id")].name = name;
}

function setHex(name){
    users[userSearch(name, "name")].hex = true;
}

function hex(msg){
    
    var hexed = "";
    
    for(var x = 0; x < msg.length; x++){
        hexed += msg.charCodeAt(x).toString(16);
    }
    
    return hexed;
}

