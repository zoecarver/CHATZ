//client side of the app
//logo
var chatz = "\
▄████▄   ██░ ██  ▄▄▄     ▄▄▄█████▓▒███████▒\n\
▒██▀ ▀█  ▓██░ ██▒▒████▄   ▓  ██▒ ▓▒▒ ▒ ▒ ▄▀░\n\
▒▓█    ▄ ▒██▀▀██░▒██  ▀█▄ ▒ ▓██░ ▒░░ ▒ ▄▀▒░\n\
▒▓▓▄ ▄██▒░▓█ ░██ ░██▄▄▄▄██░ ▓██▓ ░   ▄▀▒   ░\n\
▒ ▓███▀ ░░▓█▒░██▓ ▓█   ▓██▒ ▒██▒ ░ ▒███████▒\n\
░ ░▒ ▒  ░ ▒ ░░▒░▒ ▒▒   ▓▒█░ ▒ ░░   ░▒▒ ▓░▒░▒\n\
 ░  ▒    ▒ ░▒░ ░  ▒   ▒▒ ░   ░    ░░▒ ▒ ░ ▒\n\
░         ░  ░░ ░  ░   ▒    ░      ░ ░ ░ ░ ░\n\
░ ░       ░  ░  ░      ░  ░          ░ ░\n\
░                                  ░\n\
";

//vars:
var readline = require('readline'),
socketio = require('socket.io-client'),
util = require('util'),
color = require("ansi-color").set;
var room = "all";
var nick;
var socket = socketio.connect('http://159.203.245.251:6969');
var rl = readline.createInterface(process.stdin, process.stdout);

//emit room for start
socket.emit('room', room);
// Set the username
rl.question("Please enter a nickname: ", function(name) {
    nick = name;
    socket.emit('send', { type: 'chat', message: '---', nick: nick, Mroom: room });
    //make it pretty (sort of)
    process.stdout.write('\033c---type /room to switch rooms and ^c to exit---\n' + color(chatz , 'blue'));
    rl.prompt(true);
});
//console_out function. should not use console.log
function console_out(msg) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    console.log(msg);
    rl.prompt(true);
}
//get client input for messages
rl.on('line', function (line) {
    if (line[0] == "/" && line.length > 1) {
        var cmd = line.match(/[a-z]+\b/)[0];
        var arg = line.substr(cmd.length+2, line.length);
        chat_command(cmd, arg);

    } else {
        // send chat message
        socket.emit('send', { type: 'chat', message: line, nick: nick, Mroom: room });
        rl.prompt(true);
    }
});
//sort chat commands
function chat_command(cmd, arg) {
    switch (cmd) {

        case 'nick':
            var notice = nick + " changed their name to " + arg;
            nick = arg;
            socket.emit('send', { type: 'notice', message: notice });
            break;

        case 'msg':
            var to = arg.match(/[a-zA-Z]+\b/)[0];
            var message = arg.substr(to.length, arg.length);
            socket.emit('send', { type: 'tell', message: message, to: to, from: nick});
            rl.prompt(true);
            break;

        case 'me':
            var emote = nick + " " + arg;
            socket.emit('send', { type: 'emote', message: emote });
            break;

        case 'room':
            room = arg;
            break;

        default:
            console_out("That is not a valid command.");

    }
}
socket.on('message', function (data) {
    var leader;
    if (data.type == 'chat' && data.nick != nick) {
        leader = color(data.nick+":::\n  -->  ", "blue");
        console_out(leader + data.message);
    }
    else if (data.type == "notice") {
        console_out(color(data.message, 'cyan'));
    }
    else if (data.type == "tell" && data.to == nick) {
        leader = color("["+data.from+"->"+data.to+"]", "red");
        console_out(leader + data.message);
    }
    else if (data.type == "emote") {
        console_out(color(data.message, "cyan"));
    }
});

//work of zoe free to all! ;)
