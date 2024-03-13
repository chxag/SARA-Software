#include <AccelStepper.h>

// Define stepper motor connections and steps per revolution:
#define dirPin 2
#define stepPin 3
#define m0Pin 4
#define m1Pin 5
#define m2Pin 6
#define faultPin 0
#define enablePin 1
#define buttonPin 7
#define motorInterfaceType 1

bool faultState = false;
bool buttonState = false;
int directionMultiplier = 1;

AccelStepper stepper = AccelStepper( motorInterfaceType,
                                     stepPin,
                                     dirPin );

void setup() {
  // Pins to control the step size:
  pinMode(m0Pin, OUTPUT);
  pinMode(m1Pin, OUTPUT);
  pinMode(m2Pin, OUTPUT);

  // Set the step size to full step
  digitalWrite(m0Pin, LOW);  // Set m0 to high for half step
  digitalWrite(m1Pin, LOW);
  digitalWrite(m2Pin, LOW);
  
  pinMode(buttonPin, INPUT);
  pinMode(faultPin, INPUT);
  
  stepper.setMaxSpeed(1500);
  stepper.setMinPulseWidth(500);  // The large pulse width should help the motor pull less current from the driver, as our driver provides insufficient current
  stepper.setEnablePin(enablePin);
  stepper.setPinsInverted(false, false, true);  // Invert the enable pin
  stepper.enableOutputs();
}

void loop() {
  buttonState = digitalRead(buttonPin);
  faultState = digitalRead(faultPin);

  if (faultState == false) {
    stepper.disableOutputs();
    delayMicroseconds(10000);
  }

  if (buttonState == HIGH) {
    // Flip directions:
    directionMultiplier = -directionMultiplier;
    delayMicroseconds(200);
  }

  // Set the current position to 0:
  stepper.setCurrentPosition(0);
  while(stepper.currentPosition() != 400 * directionMultiplier)
  {
    stepper.setSpeed(200 * directionMultiplier);
    stepper.runSpeed();
  };
}
