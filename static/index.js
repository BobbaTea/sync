user = {}


if (!window.AudioContext) {
    if (!window.webkitAudioContext) {
        alert("Your browser sucks because it does NOT support any AudioContext!");
    }
    window.AudioContext = window.webkitAudioContext;
}
var ctx = new AudioContext();
document.getElementById("start").addEventListener('click', function () {
    ctx.resume().then(() => {
        console.log('Playback resumed successfully');
    });
});


if ("WebSocket" in window) {
    var unique = prompt("Enter a unique name");
//     var ws = new WebSocket("ws://127.0.0.1:5000");
var ws = new WebSocket("ws://abobba.com:5000");
    ws.onopen = function () {
        data = {
            unique: unique,
            action: "open"
        }
        ws.send(JSON.stringify(data));
    };

    ws.onmessage = function (evt) {
        // console.log(evt)
        parsed = JSON.parse(evt.data)
        console.log(parsed)
        receive(ctx, parsed.data)
    };

    ws.onclose = function () {
        console.log("Closed socket")
    };
} else {
    alert("WebSocket NOT supported by your Browser!");
}


const record = function (stream) {
    const context = new AudioContext();
    const source = context.createMediaStreamSource(stream);
    const processor = context.createScriptProcessor(1024, 1, 1);
    source.connect(processor);
    processor.connect(context.destination);
    processor.onaudioprocess = function (e) {
        // console.log(e.inputBuffer.getChannelData(0))
        data = {
            action: 'data',
            data: Array.prototype.slice.call(e.inputBuffer.getChannelData(0)),
            unique: unique
        }
        console.log(data)
        ws.send(JSON.stringify(data));
    };
};
navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    .then(record);


function receive(ctx, arr) {
    var buffer = ctx.createBuffer(1, arr.length, 48000);
    var buf = buffer.getChannelData(0);
    for (i = 0; i < arr.length; ++i) {
        buf[i] = arr[i];
    }
    play(buffer, ctx)
}

function play(buffer, context) {
    var source = context.createBufferSource(); // creates a sound source
    source.buffer = buffer;                    // tell the source which sound to play
    source.connect(context.destination);       // connect the source to the context's destination (the speakers)
    source.start(0);                           // play the source now
}





