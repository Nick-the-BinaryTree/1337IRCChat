document.addEventListener("DOMContentLoaded", function(){
    var socket = io();
    var msgCount = 0;
    
    var mouse = {
        click : false,
        move : false,
        pos : {
            x : 0,
            y : 0
        }
    };
    
    var chatBox = document.getElementById("chatBox");
    var textBox = document.getElementById("textBox");
    var canvas = document.getElementById("drawing");
    var context = canvas.getContext("2d");
    var width = window.innerWidth;
    var height = window.innerHeight;
    
    canvas.width = width;
    canvas.height = height;
    context.fillStyle = '#20C20E';
    context.font = "16px sans";
    
    var drawMode = false;
    
    canvas.onmousedown = function(e){
        mouse.click = true;
    };

    canvas.onmouseup = function(e){
        mouse.click = false;  
    };

    canvas.onmousemove = function(e){
        mouse.pos.x = e.clientX / width;
        mouse.pos.y = e.clientY /height;
        mouse.move = true;
    }
    
    document.body.onkeyup = function(e){
        if(drawMode){
            if(e.keyCode == 32){
                socket.emit('clearD');
            }
        }
        
        if(e.keyCode == 220){
            drawMode = !drawMode;
            changeMode();
        }
    }
    
    socket.on('draw_bit', function(bit){
        context.fillText(bit.val, bit.x * width, bit.y * height);
    });
    
    socket.on('clearD', function(){
        context.clearRect(0, 0, canvas.width, canvas.height);
    });

    $('form').submit(function(){
        socket.emit('chat message', $('#m').val());
        $('#m').val('');
        return false;
    });
    socket.on('chat message', function(msgPack){
        $('#messages').append($('<li>').text(msgPack.name + ": " + msgPack.msg));
        msgCount++;
        checkCount();
    });
    socket.on('list message', function(listArray){
        printArray(listArray);
    });
    socket.on('help message', function(listArray){
        printArray(listArray);
    });
    socket.on('clear message', function(){
        $('#messages').empty();
    });

    function checkCount(){
        if(msgCount > 20){
            $('#messages li').eq(0).remove();
        }   
    }
    
    function printArray(listArray){
        for(var x = 0; x < listArray.length; x++){
            $('#messages').append($('<li>').text(listArray[x]));
            msgCount++;
            checkCount();
        }
    }
    
    function changeMode(){
        if (drawMode){
            chatBox.style.display = "none";
            canvas.style.display = "block";
        }
        else{
            chatBox.style.display = "inline";
            canvas.style.display = "none";
        }
        textBox.reset();
    }
    
    function drawLoop(){
        if(mouse.click && mouse.move){
            var val = (Math.random() > .5) ? "0" : "1";
            socket.emit('draw_bit', { val : val, x : mouse.pos.x, y : mouse.pos.y });
            mouse.move = false;
        }
        
        setTimeout(drawLoop, 25);
    }
    
    drawLoop();
});