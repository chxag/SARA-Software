/*
   Uno sketch to drive a stepper motor using the AccelStepper library.
   Works with a ULN-2003 unipolar stepper driver, or a bipolar, constant voltage motor driver
   such as the L298 or TB6612, or a step/direction constant current driver like the a4988.
   Time to try some experiments!
   10/21/21  --jkl  jlarson@pacifier.com
   1. Use runSpeed to just run at a constant speed. 
      Enter a negative speed to run in opposite direction (never mind the documentation).
      Print out speed and position every second. Don't use delay()!
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

elapsedMillis printTime;    // one second info printout timer.

void setup() {
  Serial.begin(115200);
  // set the maximum speed and initial speed. The initial speed will be the only
  // speed used. No acceleration will happen - only runSpeed is used. Runs forever.
  myStepper.setMaxSpeed(200.0);    // must be equal to or greater than desired speed.
  myStepper.setSpeed(100.0);       // desired speed to run at
  //myStepper.setSpeed(-100.0);    // use this to run in opposite direction
}

void loop() {
  if (printTime >= 1000) {
    printTime = 0;
    float mSpeed = myStepper.speed();
    Serial.print(mSpeed);
    Serial.print("  ");
    Serial.println(myStepper.currentPosition());
  } 
  myStepper.runSpeed();
}
