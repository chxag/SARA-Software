Hi, let me summarise the situation.

Basic_Motor.ino works, but since it does not utilise any libraries / counter system, its difficult to track the motor's position using it. I don't fully get how it works - there's a 0.5 second delay between the positive edge of step, and another 0.5 second between the negative - yet, somehow, it gets the stepper motor to spin fast - for the life of me, I don't know why. My intial thinking was that a large delay between the steps could help the driver module to "rest", as it often struggles to keep up the necessary current output for the stepper motor. In theory, the driver should be able to work with Step pulses as fast as 1.9ms between each pulse, but my testing has not proved fruitful. Could be the current issues, or could be due to the cheap driver. This file also demonstrates how the switch can be used to detect the position of the motor.

 AcellStepper_Motor_Control.ino is the beforementioned library, it should help track the position of the motor, as well as setting the speed. However, even with a large step pulse width, I've struggled to get it to work with our motor. This could be due to the cheap driver / insufficient current, but more testing could lead to the library being operational. One thing to note is that instead of using the enablePin to enable and disable the motor, I've used the library's enable/disableOutputs() method.
 
 For Basic_Motor_Serial, there are a few things to consider. I have been using digitalWrite(enablePin, HIGH); to disable the driver module, which ensures that no current passes through to the motor during its downtime, which can cause vibrations / noise. However, it is important to have a delay between the step inputs and setting the enablePin to low, as the driver chip requires some time to "wake up". Further thing to note is that most of the delayMicroseconds are estimates - I've tried to put a delay in the .ino file for the enable signals, and a delay in the RaspberryPi_Motor.py in order to give the arduino time to return a message, but they are estimates, and suboptimal.
 
 TODO:
Get AccelStepper Library to work with motor
Polish Serial Connection
Combine Serial with AccelStepper Library
If unable to get AccelStepper to work, code own position/revolution counter / buy new driver chip
