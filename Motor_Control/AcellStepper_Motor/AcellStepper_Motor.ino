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

int pulse_width = 300;  # Was 100

#define step_delay_length 1000
#define driver_rest_us 2000
#define stepsPerRevolution 200

void forward() {
  digitalWrite(dirPin, HIGH);
  digitalWrite(stepPin, HIGH);  // Hold for minimum 2us
  delayMicroseconds(500);
  digitalWrite(stepPin, LOW);  // Hold for minimum 2us
  delayMicroseconds(500);
}

void backward() {
  digitalWrite(dirPin, LOW);
  digitalWrite(stepPin, HIGH);  // Hold for minimum 2us
  delayMicroseconds(500);
  digitalWrite(stepPin, LOW);  // Hold for minimum 2us
  delayMicroseconds(500);
}

// Create a new instance of the AccelStepper class
// AccelStepper stepper(AccelStepper::DRIVER, stepPin, dirPin);
AccelStepper stepper(forward, backward);



void setup() {
  digitalWrite(m0Pin, LOW);
  digitalWrite(m1Pin, LOW);
  digitalWrite(m2Pin, LOW);
  digitalWrite(enablePin, LOW);
  digitalWrite(sleepPin, HIGH);
  digitalWrite(resetPin, HIGH);
  stepper.setMinPulseWidth(pulse_width);
  stepper.setMaxSpeed(1000);  // Too much can cause driver to heat up due to the driver's current limits, ideally should be 1000
  stepper.setSpeed(1000); // Limited by the max speed
  stepper.setAcceleration(1);
}

void loop() {
    stepper.runSpeed();
}
