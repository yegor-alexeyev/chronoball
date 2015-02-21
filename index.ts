﻿
/// <reference path="lib/DefinitelyTyped/raphael/raphael.d.ts" />
/// <reference path="lib/DefinitelyTyped/webrtc/RTCPeerConnection.d.ts" />

var paper = Raphael(0,0,1000,1000);
//var paper = Raphael([0,0,'100%','100%']);

// Creates circle at x = 50, y = 40, with radius 10
var blueCircle = paper.circle(100, 40, 10);
var redCircle = paper.circle(150, 40, 10);
// Sets the fill attribute of the circle to red (#f00)
blueCircle.attr("fill", "#00f");
blueCircle.attr("stroke", "#fff");

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


  if ("WebSocket" in window)
  {
  }
  else
  {
     // The browser doesn't support WebSocket
     alert("WebSocket NOT supported by your Browser!");
  }

  var iceServers = {
      iceServers: [
//{'url': 'turn:yegor.tk'}
{'url': 'stun:stun.l.google.com:19302' }
      ]
  };


  var offerer= new webkitRTCPeerConnection(iceServers);
  var ice = [];

     var mediaConstraints = {
      optional: [],
      mandatory: {
        OfferToReceiveAudio: false,
        OfferToReceiveVideo: false
      }
    };

   // Let us open a web socket
   var ws = new WebSocket("ws://yegor.tk:2794" + document.location.pathname);
   ws.onopen = function() { };
   ws.onclose = function() { };
   ws.onmessage = OnWebSocketMessage;
    var channel;

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
        var newCx = controllable.attr('cx') + v[keyCode]*1000;
        obj.cx = newCx;
        controllable.animate({cx:newCx}, 10000);
    }
    if (channel.readyState == 'open') {
      channel.send(JSON.stringify(obj));
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
        var newCx = controllable.attr('cx') - v[keyCode]*1000;
        controllable.animate({cx:newCx}, 10000);
        obj.cx = newCx;
    }
    if (channel.readyState == 'open') {
      channel.send(JSON.stringify(obj));
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

function onChannelMessage(event) {
        var obj = JSON.parse(event.data);
      switch (obj.variant) {
        case "Animation":
          other.stop();
          if (typeof (obj.cx) != "undefined") {
            other.animate({cx: obj.cx}, 10000);
          }
          break;
      }
      //    alert(event.data);
          //var data = JSON.parse(event.data);
          //console.log(data);
}

    offerer.ondatachannel = function (event) {
        channel = event.channel;

      event.channel.onopen = function () {
          console.log("channel onopen");
          //event.channel.send("Hello Client!");
      };

      event.channel.onmessage = onChannelMessage;
      console.log(event);
    };


  function CreateOffer() {
    channel = offerer.createDataChannel('channel', {});
      channel.onmessage = onChannelMessage;
      channel.onopen = function () {
        console.log("channel.open");
    };

    channel.onerror = function (e) {
        console.error('channel.onerror', JSON.stringify(e, null, '\t'));
    };

    channel.onclose = function (e) {
        console.warn('channel.onclose', JSON.stringify(e, null, '\t'));
    };

    offerer.createOffer(function (offer) {
      offerer.setLocalDescription(offer, function () {
        // Web Socket is connected, send data using send()

        var obj: any = new Object();
        obj.variant = "FirstSessionDescription";
        obj.fields = offer;
        ws.send(JSON.stringify(obj));
      });
    }, function(error) {alert(error)}, mediaConstraints);

  }


  offerer.onsignalingstatechange = function (event) {
    console.log(offerer.signalingState);
  }
  offerer.onicecandidate = function (event) {
      if (!event || !event.candidate) return;

      var obj: any = new Object();
      obj.variant = "IceCandidate";
      obj.fields = event.candidate;
      ws.send(JSON.stringify(obj));

  };


  window.addEventListener("touchstart", function(event: any) { event.preventDefault(); if (event.touches[0].clientX < 300) { OnKeyDown(74); } else {OnKeyDown(75); } }, false);
  window.addEventListener("touchend", function(event: any) { event.preventDefault(); if (event.touches[0].clientX < 300) { OnKeyUp(74); } else {OnKeyUp(75); } } , false);
    window.onkeydown = function(event) {OnKeyDown(event.keyCode);};
    window.onkeyup = function(event) { OnKeyUp(event.keyCode);};

  function OnWebSocketMessage(evt) {
    var obj = JSON.parse(evt.data);
    console.log(obj);
    switch (obj.variant) {
      case "RequestOfOffer":
        controllable = blueCircle;
        other = redCircle;
        CreateOffer();
        break;

      case "FirstSessionDescription":
    //alert(obj.variant);

          var desc = new RTCSessionDescription(obj.fields);
          offerer.setRemoteDescription(desc, function() {
            for (var index = 0; index < ice.length; index++) {
              offerer.addIceCandidate(new RTCIceCandidate(ice[index]));
              //console.log(ice[index]);
            }
            ice = [];
            offerer.createAnswer(function (answer) {
                offerer.setLocalDescription(answer);
                var obj:any = new Object();
                obj.variant = "SecondSessionDescription";
                obj.fields = answer;
                ws.send(JSON.stringify(obj)); },
            function(error) {alert(error)}, mediaConstraints);
          });
        break;
      case "SecondSessionDescription":
          //var desc = new RTCSessionDescription({sdp: obj.fields, type:"answer"});
          var desc = new RTCSessionDescription(obj.fields);
          offerer.setRemoteDescription(desc);
          //console.log("answerer: " + obj.fields.sdp);
            for (var index = 0; index < ice.length; index++) {
              offerer.addIceCandidate(new RTCIceCandidate(ice[index]));
              //console.log(ice[index]);
            }
            ice = [];
          break;
      case "IceCandidate":
          //console.log(obj.fields);
          if (offerer.remoteDescription != null) {
              offerer.addIceCandidate(new RTCIceCandidate(obj.fields));
          } else {
            ice[ice.length] = obj.fields;
          }
          break;
    }
    //alert("Message is received..." + evt.data);
  }
