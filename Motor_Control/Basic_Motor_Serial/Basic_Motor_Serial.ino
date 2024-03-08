// Define stepper motor connections and steps per revolution:
#define dirPin 2
#define stepPin 3

#define m0Pin 4
#define m1Pin 5
#define m2Pin 6

#define faultPin 8
int faultState = 0;

#define enablePin 9

#define delay_length 500

#define stepsPerRevolution 200

int pythonInput;

void setup() {
  pinMode(enablePin, OUTPUT);
  pinMode(stepPin, OUTPUT);
  pinMode(dirPin, OUTPUT);
  pinMode(m0Pin, OUTPUT);
  pinMode(m1Pin, OUTPUT);
  pinMode(m2Pin, OUTPUT);
  pinMode(faultPin, INPUT);

  digitalWrite(enablePin, HIGH);
  digitalWrite(dirPin, HIGH);

  digitalWrite(m0Pin, LOW);
  digitalWrite(m1Pin, LOW);
  digitalWrite(m2Pin, LOW);

  Serial.begin(115200);
  Serial.setTimeout(1);
}

void loop() {
  while (!Serial.available());      // Wait until Serial is available
  digitalWrite(enablePin, HIGH);
  
  
  faultState = digitalRead(faultPin);
  if (faultState == LOW) {
    digitalWrite(enablePin, HIGH);
    Serial.print("Fault");
    while(true);  // Infinite loop
  }

  pythonInput = Serial.readString().toInt();

  switch (pythonInput) {
    case 1:
      Serial.print("CW");
      digitalWrite(enablePin, LOW);
      digitalWrite(dirPin, HIGH);
      delayMicroseconds(100);
      for (int i = 0; i < stepsPerRevolution * 10; i++) {
        digitalWrite(stepPin, HIGH);
        delayMicroseconds(delay_length);
        digitalWrite(stepPin, LOW);
        delayMicroseconds(delay_length);
      }
      digitalWrite(enablePin, HIGH);
      delayMicroseconds(20);
      break;
    case 2:
      Serial.print("ACW");
      digitalWrite(enablePin, LOW);
      digitalWrite(dirPin, LOW);
      delayMicroseconds(100);
      for (int i = 0; i < stepsPerRevolution * 10; i++) {
        digitalWrite(stepPin, HIGH);
        delayMicroseconds(delay_length);
        digitalWrite(stepPin, LOW);
        delayMicroseconds(delay_length);
      }
      digitalWrite(enablePin, HIGH);
      delayMicroseconds(20);
      break;
    case 0:
      digitalWrite(enablePin, HIGH);
      Serial.print("Stopping");
      break;
    default:
      digitalWrite(enablePin, HIGH);
      Serial.print("Stopping");
      break;
  }
  delayMicroseconds(500);
}
