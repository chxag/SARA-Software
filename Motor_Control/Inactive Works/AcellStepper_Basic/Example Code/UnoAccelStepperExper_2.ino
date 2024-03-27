/*
   Uno sketch to drive a stepper motor using the AccelStepper library.
   Works with a ULN-2003 unipolar stepper driver, or a bipolar, constant voltage motor driver
   such as the L298 or TB6612, or a step/direction constant current driver like the a4988.
   Time to try some experiments!
   10/21/21  --jkl  jlarson@pacifier.com
   2. Try accelerating to a speed, using run, and then switch to runSpeed to keep going.
      Can try positive and negative targets.
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

// State definitions
#define RSPD 01
#define RJSTR 02
// State variable
int state;

elapsedMillis printTime;

void setup() {
  Serial.begin(115200);
  state = RJSTR;   // initial state is run, just run
  // set the maximum speed, acceleration factor,
  // and the target position
 // myStepper.setMaxSpeed(1000.0);
  myStepper.setMaxSpeed(400.0);   // by setting this to the desired speed, the motor accelerates to this speed exactly without overshoot.
  myStepper.setAcceleration(50.);
  myStepper.moveTo(10000);    // need a target for run() to use. Must allow time to accelerate to target speed.
  // For negative rotation
  //myStepper.moveTo(-10000);    // need a target for run() to use. Must allow time to accelerate to target speed.
}

void loop() {
  float mSpeed;
  if (printTime >= 1000) {
    printTime = 0;
    mSpeed = myStepper.speed();
    Serial.print(mSpeed);
    Serial.print("  ");
    Serial.println(myStepper.currentPosition());
    //if (mSpeed <= -200.0) {       // for negative rotation
    if (mSpeed >= 200.0) {      // for positive rotation
      state = RSPD;   // switch to run speed state when target speed is reached
    }
  }
  switch (state) {
    case RSPD:
      myStepper.runSpeed();
      break;
    case RJSTR:
      myStepper.run();
      break;
  }
}
