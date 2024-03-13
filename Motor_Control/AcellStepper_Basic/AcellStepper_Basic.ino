#include <AccelStepper.h>

#define dirPin 2
#define stepPin 3
#define m0Pin 6
#define m1Pin 5
#define m2Pin 4
#define enablePin 7
#define faultPin 8
#define sleepPin 9
#define resetPin 10

int pulse_width = 2;

#define delay_length 500
#define stepsPerRevolution 200

void forward() {
  digitalWrite(dirPin, HIGH);
  digitalWrite(stepPin, HIGH);
  delayMicroseconds(delay_length);
  digitalWrite(stepPin, LOW);
  delayMicroseconds(delay_length);
}

void backward() {
  digitalWrite(dirPin, LOW);
  digitalWrite(stepPin, HIGH);
  delayMicroseconds(delay_length);
  digitalWrite(stepPin, LOW);
  delayMicroseconds(delay_length);
}

// Create a new instance of the AccelStepper class
// AccelStepper stepper(AccelStepper::DRIVER, stepPin, dirPin, 11, 11);
AccelStepper stepper(forward, backward);



void setup() {
  digitalWrite(m0Pin, LOW);
  digitalWrite(m1Pin, LOW);
  digitalWrite(m2Pin, LOW);
  digitalWrite(enablePin, LOW);
  digitalWrite(sleepPin, HIGH);
  digitalWrite(resetPin, HIGH);
  stepper.setMinPulseWidth(100);
  stepper.setMaxSpeed(300);  // Anything more causes too much heat due to the driver's current limits
  stepper.setSpeed(300); // Set the speed in steps per second
  stepper.setAcceleration(1);
}

void loop() {
    stepper.runSpeed();
}
