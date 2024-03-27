/*
   Uno sketch to drive a stepper motor using the AccelStepper library.
   Runs stepper back and forth between limits. (Like Bounce demo program.)
   Works with a ULN-2003 unipolar stepper driver, or a bipolar, constant voltage motor driver
   such as the L298 or TB6612, or a step/direction constant current driver like the a4988.
   Initial Creation: 10/15/21  --jkl  jlarson@pacifier.com
      - Rev 1 - 11/7/21      -jkl
      - Rev 2 = 12/14/21   -jkl
*/

// Include the AccelStepper Library
#include <AccelStepper.h>

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

void setup() {
  // set the maximum speed, acceleration factor,
  // and the target position
  myStepper.setMaxSpeed(1000.0);
  myStepper.setAcceleration(50.0);
  myStepper.moveTo(2000);
}

void loop() {
  // Change direction once the motor reaches target position
  /*
    if (myStepper.distanceToGo() == 0)   // this form also works - pick your favorite!
    myStepper.moveTo(-myStepper.currentPosition());

    // Move the motor one step
    myStepper.run();
  */
  // run() returns true as long as the final position 
  //    has not been reached and speed is not 0.
  if (!myStepper.run()) {  
    myStepper.moveTo(-myStepper.currentPosition());
  }
}
