var RollingSpider = require("parrot-rolling-spider"),
hr = require('hr'),
debug = true,
droneOn = false,
Leap = require("leapjs"),
rollingSpiderDrone = new RollingSpider({
  uuid: 'edba78b222784067b45ec5b6889d26ae'
}),
drone = {
  takenOff: false,
  trim: function() {
    if (debug) {
      hr.hr("-");
      console.log("Calibrating horizontal position...");
    }

    if (droneOn) {
      rollingSpiderDrone.trim();
    }
  },
  takeOff: function() {
    if (debug) {
      hr.hr("-");
      console.log("Taking off!");  
    }
    
    if (droneOn) {
      rollingSpiderDrone.takeOff();
    }
  },
  land: function() {
    if (debug) {
      drone.takenOff = false;
      hr.hr("-");
      console.log("Landing...");
    }

    if (droneOn) {
      rollingSpiderDrone.land();
    }
  },
  connect: function(callback) {
    if (debug) {
      hr.hr("-");
      console.log("Connecting...");
    }

    if (droneOn) {
      rollingSpiderDrone.connect(callback);
    } else {
      callback();
    }
  },
  hover: function () {
    if (debug) {
      console.log("Hovering...");
    }

    if (droneOn) {
      rollingSpiderDrone.hover();
    }
  },
  forward: function (speed) {
    if (debug) {
      console.log("Front...");
    }

    if (droneOn) {
      rollingSpiderDrone.forward(speed);
    }
  },
  backward: function (speed) {
    if (debug) {
      console.log("Back...");
    }

    if (droneOn) {
      rollingSpiderDrone.backward(speed);
    }
  },
  left: function (speed) {
    if (debug) {
      console.log("Left...");
    }

    if (droneOn) {
      rollingSpiderDrone.left(speed);
    }
  },
  right: function (speed) {
    if (debug) {
      console.log("Right...");
    }

    if (droneOn) {
      rollingSpiderDrone.right(speed);
    }
  },
  clockwise: function (speed) {
    if (debug) {
      console.log("Clockwise...");
    }

    if (droneOn) {
      rollingSpiderDrone.clockwise(speed);
    }
  },
  counterClockwise: function (speed) {
    if (debug) {
      console.log("Counterclockwise...");
    }

    if (droneOn) {
      rollingSpiderDrone.counterClockwise(speed);
    }
  }
},
leapController = new Leap.Controller({
  enableGestures: true
}),
normalizeRads = function (rads) {
  return Math.round(rads * 180 / Math.PI);
},
processRollPitchYaw = function (drone, roll, pitch, yaw) {
  var threshold = 15;
  if (Math.abs(roll) > threshold) {
    if (roll > 0) {
      drone.backward(10);
    } else {
      drone.forward(10);
    }
  }

  if (Math.abs(pitch) > threshold) {
    if (pitch > 0) {
      drone.left(10);
    } else {
      drone.right(10);
    }
  }

  if (Math.abs(yaw) > threshold) {
    if (yaw > 0) {
      drone.clockwise(10);
    } else {
      drone.counterClockwise(10);
    }
  }
};

drone.connect(function () {
  leapController.on('frame', function (frame) {
    if (frame.valid && frame.hands) {
      var gestures = frame.gestures;
      switch (frame.hands.length) {
        case 1: 
          var hand = frame.hands[0];
          var confidence = hand.confidence;
          if (confidence > .7) {
            var roll = normalizeRads(hand.pitch());
            var pitch = normalizeRads(hand.roll());
            var yaw = normalizeRads(hand.yaw());

            processRollPitchYaw(drone, roll, pitch, yaw);
          } else {
            drone.hover();
          }
          break;
        case 2:
          if (frame.hands.length === 2 && gestures && gestures.length) {
            for (var i = 0; i < gestures.length; i++) {
              var gesture = gestures[i];
              console.log(gesture);
              console.log("Gesture: " + gesture.type);
              if (gesture.type === "swipe") {
                var swipeIsHorizontal = Math.abs(gesture.direction[0]) > Math.abs(gesture.direction[1]);
                if (!swipeIsHorizontal) {
                  if (!drone.takenOff && gesture.direction[1] > 0){

                    // Swiping up!
                    drone.trim();
                    drone.takeOff();
                  } else if (drone.takenOff && gesture.direction[1] < 0) {

                    // Swiping down
                    drone.land();
                  }
                }
              }
            }
          }
          break;
      }
    }
  });

  leapController.connect();
  console.log("Connected");
});
