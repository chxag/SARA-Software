// Define stepper motor connections and steps per revolution:
// Pins 0 and 1 are serial pins left unassigned
#define dirPin 2
#define stepPin 3

#define m0Pin 4
#define m1Pin 5
#define m2Pin 6

#define faultPin 8
#define enablePin 9

#define topButtonPin 10
#define bottomButtonPin 11

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
  pinMode(topButtonPin, INPUT);
  pinMode(bottomButtonPin, INPUT);

  digitalWrite(enablePin, HIGH);  // Disable the driver
  digitalWrite(dirPin, HIGH);  // Set the initial direction
  digitalWrite(m0Pin, LOW);  // Set the step size
  digitalWrite(m1Pin, LOW);
  digitalWrite(m2Pin, LOW);

  Serial.begin(9600);  // Begin serial transmission
  Serial.setTimeout(1);
}


// Check if the arm has hit the top button
bool checkTopHit(){
  return digitalRead(topButtonPin);
}


// Check if the arm has hit the bottom button:
bool checkBottomHit(){
  return digitalRead(bottomButtonPin);
}


// Run the motor n revolutions in the given directoin
void runMotor(int n, int dir){
  // Enable the motor and set the direction, wait
  digitalWrite(enablePin, LOW);
  digitalWrite(dirPin, dir);
  delayMicroseconds(20);

  // Run the motor
  for (int i = 0; i < stepsPerRevolution * n; i++) {
    digitalWrite(stepPin, HIGH);
    delayMicroseconds(delay_length);
    digitalWrite(stepPin, LOW);
    delayMicroseconds(delay_length);
  }

  // Disable the motor and wait
  digitalWrite(enablePin, HIGH);
  delayMicroseconds(20);
}


// Run the motor until it reaches the top ot bottom
void runMotorHit(int dir){
  // Enable the motor and set the direction, wait
  digitalWrite(enablePin, LOW);
  digitalWrite(dirPin, dir);
  delayMicroseconds(20);

  // Run the motor
  while ((checkTopHit() == false && dir == HIGH) || (checkBottomHit() == true && dir == LOW)){
    digitalWrite(stepPin, HIGH);
    delayMicroseconds(delay_length);
    digitalWrite(stepPin, LOW);
    delayMicroseconds(delay_length);
  }

  // Disable the motor and wait
  digitalWrite(enablePin, HIGH);
  delayMicroseconds(20);
}

void loop() {
  digitalWrite(enablePin, HIGH);  // Disable the driver
  while (!Serial.available());  // Wait until Serial is available


  // Potentially unecessary - if the driver overheats, it will give a fault but eventually turn on when it warms up
  if (digitalRead(faultPin) == LOW) {
    digitalWrite(enablePin, HIGH);
    Serial.print("Fault");
    while(true);  // Infinite loop
  }

  pythonInput = Serial.readString().toInt();

  switch (pythonInput) {
    // Hit the top button:
    case 1:
      runMotorHit(HIGH);
      break;

    // Hit the bottom button:
    case 2:
      runMotorHit(LOW);
      break;

    // If any other command is sent, stop:
    default:
      digitalWrite(enablePin, HIGH);
      Serial.print("Stopping");
      break;
  }
  delayMicroseconds(500);
}
