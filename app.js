var RollingSpider = require("parrot-rolling-spider"),
hr = require('hr'),
Leap = require("leapjs"),
drone = new RollingSpider({
  uuid: 'edba78b222784067b45ec5b6889d26ae'
}),
// drone = {
//   takenOff: false,
//   trim: function() {
//     hr.hr("-");
//     console.log("Calibrating horizontal position...");
//   },
//   takeOff: function() {
//     drone.takenOff = true;
//     hr.hr("-");
//     console.log("Taking off!");
//   },
//   land: function() {
//     drone.takenOff = false;
//     hr.hr("-");
//     console.log("Landing...");
//   },
//   connect: function(callback) {
//     hr.hr("-");
//     console.log("Connecting...");
//     callback();
//   }
// },
leapController = new Leap.Controller({
  enableGestures: true
}),
speedDelta = 2;

drone.connect(function () {
  
  leapController.on('gesture', function (gesture) {
    console.log("aa");
    console.log("Gesture: " + gesture.type);
    var handIds = gesture.handIds;
    console.log(handIds);
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
  });

  leapController.on('frame', function (frame) {
    console.log("bb");
    if (frame.isValid && frame.hands && frame.hands.length === 2) {
      var velocity = hand.palmVelocity; 
      var direction = hand.direction;

    }
  });

  leapController.connect();
  console.log("Connected");
});
