// Define stepper motor connections and steps per revolution:
#define dirPin 2
#define stepPin 3

#define m0Pin 4
#define m1Pin 5
#define m2Pin 6

#define faultPin 8
int faultState = 0;

#define enablePin 9

#define buttonPin 7
int buttonState = 0;

#define delay_length 500

#define stepsPerRevolution 200

void setup() {
  pinMode(enablePin, OUTPUT);
  pinMode(stepPin, OUTPUT);
  pinMode(dirPin, OUTPUT);
  pinMode(m0Pin, OUTPUT);
  pinMode(m1Pin, OUTPUT);
  pinMode(m2Pin, OUTPUT);
  pinMode(buttonPin, INPUT);
  pinMode(faultPin, INPUT);

  digitalWrite(enablePin, LOW);
  digitalWrite(dirPin, HIGH);
}

void loop() {
  buttonState = digitalRead(buttonPin);
  faultState = digitalRead(faultPin);

  if (faultState == LOW) {
    digitalWrite(enablePin, HIGH);
  }

  if (buttonState == HIGH) {
    digitalWrite(dirPin, !digitalRead(dirPin));
    delayMicroseconds(1000);
  }
  
  digitalWrite(m0Pin, LOW);
  digitalWrite(m1Pin, LOW);
  digitalWrite(m2Pin, LOW);
  
  // Spin the stepper motor 1 revolution slowly:
  for (int i = 0; i < stepsPerRevolution; i++) {
    // These four lines result in 1 step:
    digitalWrite(stepPin, HIGH);
    delayMicroseconds(2 * delay_length);
    digitalWrite(stepPin, LOW);
  }
}
