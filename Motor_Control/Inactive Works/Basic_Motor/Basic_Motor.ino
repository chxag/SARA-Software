// Define stepper motor connections and steps per revolution:
#define dirPin 2
#define stepPin 3
#define m0Pin 6
#define m1Pin 5
#define m2Pin 4
#define enablePin 7
#define faultPin 8
#define sleepPin 9
#define resetPin 10

int delay_length = 500;
#define stepsPerRevolution 200

void setup() {
  pinMode(dirPin, OUTPUT);
  pinMode(stepPin, OUTPUT);
  pinMode(m0Pin, OUTPUT);
  pinMode(m1Pin, OUTPUT);
  pinMode(m2Pin, OUTPUT); 
  pinMode(enablePin, OUTPUT);
  pinMode(faultPin, INPUT);
  pinMode(sleepPin, OUTPUT);
  pinMode(resetPin, OUTPUT);

  digitalWrite(dirPin, HIGH);
  digitalWrite(stepPin, LOW);
  digitalWrite(m0Pin, LOW);
  digitalWrite(m1Pin, LOW);
  digitalWrite(m2Pin, LOW);
  digitalWrite(enablePin, LOW);
  digitalWrite(sleepPin, HIGH);
  digitalWrite(resetPin, HIGH);
}

void loop() {
  digitalWrite(enablePin, LOW);
  delay(100);
  // Spin the stepper motor N revolutions slowly:
  for (int i = 0; i < 20 * stepsPerRevolution; i++) {
    // These four lines result in 1 step:
    digitalWrite(stepPin, HIGH);
    delayMicroseconds(delay_length);
    digitalWrite(stepPin, LOW);
    delayMicroseconds(delay_length);
  }
  digitalWrite(enablePin, HIGH);
  delay(500000);
}
