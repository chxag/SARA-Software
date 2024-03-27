// Define stepper motor connections and steps per revolution:
// Pins 0 and 1 are serial pins left unassigned
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

#define topButtonPin 11
#define bottomButtonPin 12

#define delay_length 500
#define stepsPerRevolution 200
int pythonInput;
bool flag;


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
  digitalWrite(sleepPin, HIGH);
  digitalWrite(resetPin, HIGH);

  flag = false;
  
  Serial.begin(9600);  // Begin serial transmission
  Serial.setTimeout(5);
  
  digitalWrite(enablePin, HIGH);  // Disable the driver
  while (!Serial.available());  // Wait until Serial is available
  Serial.print("Connected");
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
  flag = true;
}


// Run the motor until it reaches the top or bottom
void runMotorHit(int dir){
  // Enable the motor and set the direction, wait
  digitalWrite(enablePin, LOW);
  digitalWrite(dirPin, dir);
  delayMicroseconds(20);

  // Run the motor
  while (checkTopHit() == false || checkBottomHit() == false){
    digitalWrite(stepPin, HIGH);
    delayMicroseconds(delay_length);
    digitalWrite(stepPin, LOW);
    delayMicroseconds(delay_length);
  }

  // Disable the motor and wait
  digitalWrite(enablePin, HIGH);
  delayMicroseconds(20);
  flag = true;
}

void loop() {
  // Potentially unecessary - if the driver overheats, it will give a fault but eventually turn on when it warms up
  if (digitalRead(faultPin) == LOW) {
    digitalWrite(enablePin, HIGH);
    Serial.print("Fault");
    delay(10000);  // Wait 10 seconds
  }

  pythonInput = Serial.readString().toInt();
  
  switch (pythonInput) {
    // Hit the top button:
    case 1:
      Serial.print("Going Up!");
      runMotorHit(HIGH);
      while(!flag);
      Serial.print("Done Going Up!");
      flag = false;
      break;

    // Hit the bottom button:
    case 2:
      Serial.print("Going Down!");
      runMotorHit(LOW);
      while(!flag);
      Serial.print("Done Going Down!");
      flag = false;
      break;

    // If any other command is sent, stop:
    default:
      digitalWrite(enablePin, HIGH);
      break;
  }
}
