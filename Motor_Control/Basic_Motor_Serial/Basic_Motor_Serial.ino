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
int interrupt = 0;
bool doneFlag;

// If no serial input is made, run the "default" case
int num1 = 0;
int num2 = 0;


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

  digitalWrite(enablePin, HIGH);  // Disable the driver

  doneFlag = false;
  
  Serial.begin(9600);  // Begin serial transmission
  Serial.setTimeout(5);
}


// Check if the arm has hit the top button
bool checkTopHit(){
  return digitalRead(topButtonPin);
}


// Check if the arm has hit the bottom button:
bool checkBottomHit(){
  return digitalRead(bottomButtonPin);
}

bool checkInterrupt(){
    String data = Serial.readStringUntil('\n');
    // Note that int values can overflow easily and inputs are not sanitised
    interrupt = data.substring(0, 1).toInt();

   if (interrupt == 7){
    return true;
   } else{
       return false;
   }
}

void run(){
    // Run the motor one step at last set direction
    digitalWrite(stepPin, HIGH);
    delayMicroseconds(delay_length);
    digitalWrite(stepPin, LOW);
    delayMicroseconds(delay_length);
}


// Run the motor n revolutions in the given directoin
void runMotor(int n, int dir){
  // Enable the motor and set the direction, wait
  digitalWrite(enablePin, LOW);
  digitalWrite(dirPin, dir);
  delay(100);

  // Run the motor
  for (int i = 0; i < stepsPerRevolution * n; i++) {
    run();
    if (checkInterrupt()){
      break;
    }
  }

  // Disable the motor and wait
  digitalWrite(enablePin, HIGH);
  delayMicroseconds(20);
  doneFlag = true;
}


// Run the motor until it reaches the top or bottom
void runMotorHit(int dir){
  // Enable the motor and set the direction, wait
  digitalWrite(enablePin, LOW);
  digitalWrite(dirPin, dir);
  delay(100);

  // Run the motor
  while (checkTopHit() == false || checkBottomHit() == false ){
    digitalWrite(stepPin, HIGH);
    delayMicroseconds(delay_length);
    digitalWrite(stepPin, LOW);
    delayMicroseconds(delay_length);
    if (checkInterrupt()){
      break;
    }
  }

  // Disable the motor and wait
  digitalWrite(enablePin, HIGH);
  delayMicroseconds(20);
  doneFlag = true;
}

void loop() {
  // Potentially unecessary - if the driver overheats, it will give a fault but eventually turn on
  // by itself when it cools down
  if (digitalRead(faultPin) == LOW) {
    digitalWrite(enablePin, HIGH);
    Serial.println("Fault");
    delay(10000);  // Wait 10 seconds
  }

    if (Serial.available()){
        String data = Serial.readStringUntil('\n');
        // Note that int values can overflow easily and inputs are not sanitised
        int num1 = data.substring(0, 1).toInt();
        int num2 = data.substring(2).toInt(); // Will return 0 if the no integer in char[2] onwards

        doneFlag = false;
    
        switch (num1) { // Check the first number
            // Hit the top button: BLOCKING
            case 1: // Go up until any button is pressed
              Serial.println("1");  // Print lines for debugging
              runMotorHit(LOW);
              while(!doneFlag);
              break;
        
            // Hit the bottom button: BLOCKING
            case 2: // Go down until any button is pressed
              Serial.println("2");
              runMotorHit(HIGH);
              while(!doneFlag);
              break;
        
            case 3: // Go up 20 revolutions NON-BLOCKING
              Serial.println("3");
              runMotor(20, LOW);
              break;
        
            case 4: // Go down 20 revolutions NON-BLOCKING
              Serial.println("4");
              runMotor(20, HIGH);
              break;
        
            case 5: // Go up n revolutions NON-BLOCKING
              Serial.print("5 ");
              Serial.println(num2);
              runMotor(num2, LOW);
              break;
        
            case 6: // Go down n revolutions NON-BLOCKING
              Serial.print("6 ");
              Serial.println(num2);
              runMotor(num2, HIGH);
              break;
            
            // If any other command is sent the python code shouldn't let that and something went wrong:
            default:
              Serial.println("Default");
              // Do nothing
              break;
        }
    }
}
