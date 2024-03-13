#define enablePin_12 2
#define enablePin_34 3

#define onePin 4
#define twoPin 5
#define threePin 6
#define fourPin 7

void setup() {
  pinMode(enablePin_12, OUTPUT);
  pinMode(enablePin_34, OUTPUT);

  pinMode(onePin, OUTPUT);
  pinMode(twoPin, OUTPUT);
  pinMode(threePin, OUTPUT);
  pinMode(fourPin, OUTPUT);
  
  digitalWrite(enablePin_12, HIGH);
  digitalWrite(enablePin_34, HIGH);
}

void loop() {
  digitalWrite(onePin, HIGH);
  digitalWrite(twoPin, LOW);
  digitalWrite(threePin, HIGH);
  digitalWrite(fourPin, LOW);
  delayMicroseconds(500);
  digitalWrite(onePin, LOW);
  digitalWrite(twoPin, HIGH);
  digitalWrite(threePin, HIGH);
  digitalWrite(fourPin, LOW);
  delayMicroseconds(500);
  digitalWrite(onePin, LOW);
  digitalWrite(twoPin, HIGH);
  digitalWrite(threePin, LOW);
  digitalWrite(fourPin, HIGH);
  delayMicroseconds(500);
  digitalWrite(onePin, HIGH);
  digitalWrite(twoPin, LOW);
  digitalWrite(threePin, LOW);
  digitalWrite(fourPin, HIGH);
  delayMicroseconds(500);
}
