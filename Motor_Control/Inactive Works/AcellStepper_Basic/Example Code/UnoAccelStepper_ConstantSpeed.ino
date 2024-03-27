/*
   Uno sketch to drive a stepper motor using the AccelStepper library.
   Works with a ULN-2003 unipolar stepper driver, or a bipolar, constant voltage motor driver
   such as the L298 or TB6612, or a step/direction constant current driver like the a4988.
// Shows how to run AccelStepper in the simplest,
// fixed speed mode with no accelerations using runSpeed().
// Mike McCauley (mikem@airspayce.com)
// Copyright (C) 2009 Mike McCauley
12/26/21  Modified to use various drivers vice default.   --jkl
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

void setup()
{  
   myStepper.setMaxSpeed(1000);   // this limits the value of setSpeed(). Raise it if you like.
   myStepper.setSpeed(50);	   // runSpeed() will run the motor at this speed - set it to whatever you like.
}

void loop()
{  
   myStepper.runSpeed();   // This will run the motor forever.
}
