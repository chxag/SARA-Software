import serial
import time

# List of possible port names to try
possible_ports = ['/dev/ttyACM1', '/dev/ttyACM2', '/dev/ttyACM3']  # ttyACM0 is reserved

# Try opening each port until one works
for port in possible_ports:
    try:
        ser = serial.Serial(port, 9600)
        print("Connected to", port)
        break
    except serial.SerialException:
        print("Failed to connect to", port)

print("For commands 5/6, enter two integers with space in between them (eg: 5 50")
if 'ser' in locals():
    try:
        while True:
            # Ask the user for a command
            command = raw_input("Enter (1/2/3/4/5 n/6 n)")  # 7 to interrupt has been discontinued
            if command == '1':
                print("Sending 1")
                ser.write(b'1\n')  # Send command '1' (as bytes)
            elif command == '2':
                print("Sending 2")
                ser.write(b'2\n')
            elif command == '3':
                print("Sending 3")
                ser.write(b'3\n')
            elif command == '4':
                print("Sending 4")
                ser.write(b'4\n')
            elif command[0] == '5':
                print(str(command + '\n'))
                ser.write(str(command + '\n'))
            elif command[0] == '6':
                print(str(command + '\n'))
                ser.write(str(command + '\n'))
                

    except KeyboardInterrupt:
        print("\nProgram stopped by user.")

    # Close serial port
    ser.close()
else:
    print("No Arduino detected")
