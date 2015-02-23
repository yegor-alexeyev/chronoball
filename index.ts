
/// <reference path="lib/DefinitelyTyped/raphael/raphael.d.ts" />
/// <reference path="lib/DefinitelyTyped/webrtc/RTCPeerConnection.d.ts" />

var paper = Raphael(0,0,1000,1000);
//var paper = Raphael([0,0,'100%','100%']);

// Creates circle at x = 50, y = 40, with radius 10
var blueCircle = paper.rect(100, 40, 50,20,5);
var redCircle = paper.rect(150, 240, 50, 20, 5);
// Sets the fill attribute of the circle to red (#f00)
blueCircle.attr("fill", "#00f");
blueCircle.attr("stroke", "#fff");

var ball = paper.circle(120, 100, 6);
ball.attr("fill", "#0f0");

// Sets the stroke attribute of the circle to white
redCircle.attr("fill", "#f00");
redCircle.attr("stroke", "#fff");

var controllable = redCircle;
var other = blueCircle;


var p = [];
var v = [];
p[74] = false;
p[75] = false;
v[74] = -1;
v[75] = 1;



var peerHandlers = {};
peerHandlers['Animation'] = function (obj) {
    other.stop();
    if (typeof (obj.x) != "undefined") {
        other.animate({x: obj.x}, 10000);
    }
}

var x = {};
x[1] = other
x[-1] = controllable;
var current = -1;


var chan: RtcChannel;
var channelIsOpened = false;

    function callback() {
        if (ball.getBBox().x >= redCircle.getBBox().x && ball.getBBox().x2 <= redCircle.getBBox().x2)
        {
            current = -current;
            ball.animate({cy: x[current].getBBox().y2 -ball.attr('r')}, 2600, 'linear', callback);
        }
    }

class Main implements RtcChannelHandler {
    constructor() {
        console.log('main');
        chan = new RtcChannel(this);
    }


    opened() {
        channelIsOpened = true;
        ball.animate({cy: redCircle.getBBox().y - ball.attr('r')}, 3000, 'linear',  callback);
    }

    received(data) {
        var obj = JSON.parse(data);
        console.debug('Peer message received: ' + event.data);
        if (obj.variant in peerHandlers) {
            peerHandlers[obj.variant](obj);
        }
        else {
            console.warn('Unrecognized peer message: ' + obj.variant);
        }
    }

    iAmFirst() {
        console.log('iamfirst');
        controllable = blueCircle;
        other = redCircle;
    }
}

var main = new Main();

if ("WebSocket" in window)
{
}
else
{
    // The browser doesn't support WebSocket
    alert("WebSocket NOT supported by your Browser!");
}


function OnKeyDown(keyCode) {
    if (keyCode != 74 && keyCode != 75) {
        return;
    }
    console.log("down " + keyCode);

    if (p[keyCode]) {
        console.log('confused on key down');
    }
    p[keyCode] = true;
    controllable.stop();
    var obj: any = new Object();
    obj.variant = "Animation";
    if (!p[74] || !p[75]) {
        var newCx = controllable.attr('x') + v[keyCode]*1000;
        obj.x = newCx;
        controllable.animate({x:newCx}, 10000);
    }
    if (channelIsOpened ) {
        chan.send(JSON.stringify(obj));
    } else {
        console.warn('skipped p2p message');
    }
}

function OnKeyUp(keyCode) {
    if (keyCode != 74 && keyCode != 75) {
        return;
    }
    console.log("up " + keyCode);
    if (!p[keyCode]) {
        console.log('confused on key up');
    }
    p[keyCode] = false;
    controllable.stop();
    var obj: any = new Object();
    obj.variant = "Animation";
    if (p[74] || p[75]) {
        var newx = controllable.attr('x') - v[keyCode]*1000;
        controllable.animate({x:newx}, 10000);
        obj.x = newx;
    }
    if (channelIsOpened) {
        chan.send(JSON.stringify(obj));
    } else {
        console.warn('skipped p2p message');
    }
}

if (window['DeviceOrientationEvent']) {
    console.log("DeviceOrientation is supported");
    window.addEventListener('deviceorientation', function(event) {
        //console.log(JSON.stringify(event));
        if (Math.abs(event.gamma) < 10) {
            if (p[74]) {
                OnKeyUp(74);
            }
            if (p[75]) {
                OnKeyUp(75);
            }
            return;
        }
        if (event.gamma > 0 && !p[75]) {
            OnKeyUp(74);
            OnKeyDown(75);

        }
        if (event.gamma < 0 && !p[74]) {
            OnKeyUp(75);
            OnKeyDown(74);
        }
        //  console.log(event.absolute + ' ' + event.alpha + ' : ' + event.beta + ' : ' + event.gamma);
    });
} else {
    console.log("DeviceOrientation is not");
}






window.addEventListener("touchstart", function(event: any) { event.preventDefault(); if (event.touches[0].clientX < 300) { OnKeyDown(74); } else {OnKeyDown(75); } }, false);
window.addEventListener("touchend", function(event: any) { event.preventDefault(); if (event.touches[0].clientX < 300) { OnKeyUp(74); } else {OnKeyUp(75); } } , false);
window.onkeydown = function(event) {OnKeyDown(event.keyCode);};
window.onkeyup = function(event) { OnKeyUp(event.keyCode);};
