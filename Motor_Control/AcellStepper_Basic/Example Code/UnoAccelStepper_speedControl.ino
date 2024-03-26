
/*
   Uno sketch to drive a stepper motor using the AccelStepper library.
   Function runSpeed() is used to run the motor at constant speed. A pot is read to vary the speed.
   Works with a ULN-2003 unipolar stepper driver, or a bipolar, constant voltage motor driver
   such as the L298 or TB6612, or a step/direction constant current driver like the a4988.
   A potentiometer is connected to analog input 0 and to gnd and 5v.

 The motor will rotate one direction. The higher the potentiometer value,
 the faster the motor speed. Because setSpeed() sets the delay between steps,
 you may notice the motor is less responsive to changes in the sensor value at
 low speeds.

 Created 30 Nov. 2009
 Modified 28 Oct 2010
 by Tom Igoe
 12/26/21  Modified to use AccelStepper.  --jkl

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

elapsedMillis printTime;

const int maxSpeedLimit = 1000.0;  // set this to the maximum speed you want to use.

void setup() {
  Serial.begin(115200);
  // set the maximum speed and initial speed.
  myStepper.setMaxSpeed(maxSpeedLimit); 
  myStepper.setSpeed(maxSpeedLimit/5.0);    // initial speed target
}


void loop() {
    float mSpeed;
  if (printTime >= 1000) {    // print every second
    printTime = 0;
    mSpeed = myStepper.speed();
    Serial.print(mSpeed);
    Serial.print("  ");
    Serial.println(myStepper.currentPosition());
  }
  // read the sensor value:
  int sensorReading = analogRead(A0);
  // map it to a the maximum speed range
  int motorSpeed = map(sensorReading, 0, 1023, 5, maxSpeedLimit);
  // set the motor speed:
  if (motorSpeed > 0) {
    myStepper.setSpeed((float)motorSpeed);
  }
  myStepper.runSpeed();
}
