/*
   Uno sketch to drive a stepper motor using the AccelStepper library.
   Works with a ULN-2003 unipolar stepper driver, or a bipolar, constant voltage motor driver
   such as the L298 or TB6612, or a step/direction constant current driver like the a4988.
   Time to try some experiments!
   10/21/21  --jkl  jlarson@pacifier.com
   3. Like Experiment 2, add a sudden stop when a time has passed (could be any signal).
      With setAcceleraion left at 50, motor stops in ~400 steps. With setAcceleraion to
      200 just before calling stop() (as shown), motor stops in ~100 steps.
   3A. Uses run() to bring motor to a stop.
*/
// Include the AccelStepper Library
#include <AccelStepper.h>
#include <elapsedMillis.h>

// Motor Connections (unipolar motor driver)
const int In1 = 8;
const int In2 = 9;
const int In3 = 10;
const int In4 = 11;
// Motor Connections (constant voltage bipolar H-bridge motor driver)
const int AIn1 = 8;
const int AIn2 = 9;
const int BIn1 = 10;
const int BIn2 = 11;
// Motor Connections (constant current, step/direction bipolar motor driver)
const int dirPin = 4;
const int stepPin = 5;

// Creates an instance - Pick the version you want to use and un-comment it. That's the only required change.
//AccelStepper myStepper(AccelStepper::FULL4WIRE, AIn1, AIn2, BIn1, BIn2);  // works for TB6612 (Bipolar, constant voltage, H-Bridge motor driver)
//AccelStepper myStepper(AccelStepper::FULL4WIRE, In1, In3, In2, In4);    // works for ULN2003 (Unipolar motor driver)
AccelStepper myStepper(AccelStepper::DRIVER, stepPin, dirPin);           // works for a4988 (Bipolar, constant current, step/direction driver)

// define the time limit to run before stopping
const int timeLimit = 10;  // number of seconds

// State definitions
#define RSPD 01
#define RJSTR 02
//#define STOPPED 03
// State variable
int state;

elapsedMillis printTime;

void setup() {
  Serial.begin(115200);
  state = RJSTR;   // initial state is run, just run
  // set the maximum speed, acceleration factor,
  // and the target position
  myStepper.setMaxSpeed(400.);
  myStepper.setAcceleration(50.0);
  myStepper.moveTo(10000);
}
int lCount = 0; // elapsed seconds
void loop() {
  float mSpeed;
  if (printTime >= 1000) {
    printTime = 0;
    lCount++;
    mSpeed = myStepper.speed();
    Serial.print(mSpeed);
    Serial.print("  ");
    Serial.println(myStepper.currentPosition());
    switch (state) {
      //digitalWrite(markerPin,HIGH);    // just for testing
      case RSPD:
        if (lCount >= timeLimit) {
          //myStepper.setAcceleration(200.0);  // this makes motor stop much quicker!
          myStepper.stop();
          //myStepper.runToPosition();   // go immediately to stop position!
          //state = STOPPED;
          state = RJSTR;
        }
        break;
      case RJSTR:
        if (mSpeed >= 200.0) {
          state = RSPD;   // switch to run speed state when target speed is reached
        }
        break;
//      case STOPPED:
//        break;
    }
  }
  switch (state) {
    case RSPD:
      myStepper.runSpeed();
      break;
    case RJSTR:
      myStepper.run();
      break;
//    case STOPPED:
//      break;
  }
}
