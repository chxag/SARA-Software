/*
   Uno sketch to drive a stepper motor using the AccelStepper library.
   Works with a ULN-2003 unipolar stepper driver, or a bipolar, constant voltage motor driver
   such as the L298 or TB6612, or a step/direction constant current driver like the a4988.
   This code is a response to a Forum question.
   It will accelerate the motor, then run at constant speed until an interrupt occurs, stop the motor,
   then return it to it's starting (0) position.
   10/27/21   -jkl
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

const int sensorPin = 9;  // used as an end stop sensor output - driven by a timer
// hook to pin D2 - or can drive D2 directly (tie low, then disconnect to cause interrupt)

// define the time limit to run before stopping if using sensorPin
const int timeLimit = 10;  // number of seconds

// State definitions
#define RSPD 01
#define RJSTR 02
#define RUN_HOME 03
#define STOP_NOW 04
// State variable
volatile int state;   // must survive interrupts

elapsedMillis printTime;

volatile int enabFlag;  // controls the end stop sensor interrupt

void setup() {
  Serial.begin(115200);
  attachInterrupt(0, rising, RISING);  // Interrupt 0 is pin D2
  enabFlag = 1; // enable the sensor interrupt
  pinMode (sensorPin, OUTPUT);
  state = RJSTR;   // initial state is run, just run
  // set the maximum speed, acceleration factor, and the target position
  myStepper.setMaxSpeed(400.);
  myStepper.setAcceleration(50.0);
  myStepper.moveTo(-10000);
}
int lCount = 0; // elapsed seconds
void loop() {
  float mSpeed;
  if (printTime >= 1000) {    // happens once per second
    printTime = 0;
    lCount++;
    mSpeed = myStepper.speed();
    Serial.print(mSpeed);
    Serial.print("  ");
    Serial.println(myStepper.currentPosition());
    switch (state) {
      case RSPD:
        if (lCount >= timeLimit) {
          digitalWrite(sensorPin,HIGH);    // This will trigger interrupt
        }
        break;
      case RJSTR:
        if (mSpeed <= -200.0) {
          state = RSPD;   // switch to run speed state when target speed is reached
        }
        break;
      case RUN_HOME:
      case STOP_NOW:
        break;
    }
  }
  switch (state) {    // happens each loop - about 70KHz
    case RSPD:
      myStepper.runSpeed();
      break;
    case RJSTR:
    case RUN_HOME:
      myStepper.run();
      break;
    case STOP_NOW:
      digitalWrite(sensorPin,LOW);    // removes interrupt signal
      myStepper.setAcceleration(200.0);  // this makes motor stop much quicker!
      myStepper.stop();
      myStepper.runToPosition();  // brings to a stop!
      myStepper.moveTo(0);  // now return to home position
      myStepper.setAcceleration(50.0);  // slow motor acceleration back down
      //myStepper.move(-myStepper.currentPosition()); // This should work also
      state = RUN_HOME;
      break;
  }
}
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//+++++++++++++++++ Interrupt service routine +++++++++++++++++++++++++++++
//  Come here if rising edge on D2.
//  If enable flag is true, enter state STOP_NOW
void rising() {
  if (enabFlag == 1) {
    state = STOP_NOW;
    enabFlag = 0;
  }
}
