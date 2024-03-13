// Define stepper motor connections and steps per revolution:
#define dirPin 2
#define stepPin 3

#define m0Pin 6
#define m1Pin 5
#define m2Pin 4

#define faultPin 8
int faultState = 0;

#define enablePin 7

#define delay_length 500

#define stepsPerRevolution 200 * 10

void setup() {
  pinMode(enablePin, OUTPUT);
  pinMode(stepPin, OUTPUT);
  pinMode(dirPin, OUTPUT);
  pinMode(m0Pin, OUTPUT);
  pinMode(m1Pin, OUTPUT);
  pinMode(m2Pin, OUTPUT);
  pinMode(faultPin, INPUT);

  digitalWrite(enablePin, LOW);
  digitalWrite(dirPin, LOW);

  digitalWrite(m0Pin, LOW);
  digitalWrite(m1Pin, LOW);
  digitalWrite(m2Pin, LOW);
}

void loop() {
  faultState = digitalRead(faultPin);

  if (faultState == LOW) {
    digitalWrite(enablePin, HIGH);
    delayMicroseconds(25000);
  }

  if (faultState == HIGH) {
    digitalWrite(enablePin, LOW);
    delayMicroseconds(1000);
  }
  
  // Spin the stepper motor 1 revolution slowly:
  for (int i = 0; i < stepsPerRevolution; i++) {
    // These four lines result in 1 step:
    digitalWrite(stepPin, HIGH);
    delayMicroseconds(delay_length);
    digitalWrite(stepPin, LOW);
    delayMicroseconds(delay_length);
  }
}
