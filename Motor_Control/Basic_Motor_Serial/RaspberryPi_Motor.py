import serial
import time

# List of possible port names to try
possible_ports = ['/dev/ttyACM0', '/dev/ttyACM1', '/dev/ttyACM2', '/dev/ttyACM3']

# Try opening each port until one works
for port in possible_ports:
    try:
        ser = serial.Serial(port, 9600)
        print(f"Connected to {port}")
        break
    except serial.SerialException:
        print(f"Failed to connect to {port}")

print("For commands 5/6, enter two integers with space in between them (eg: 5 50")
if 'ser' in locals():
    try:
        while True:
            # Ask the user for a command
            print()
            command = input("Enter (1/2/3/4/5 n/6 n) or 7 to interrupt the current command ")
            if command == '1':
                ser.write(b'1\n')  # Send command '1' (as bytes)
            elif command == '2':
                ser.write(b'2\n')  # Send command '2' (as bytes)
            elif command == '3':
                ser.write(b'3\n')  # Send command '3' (as bytes)
            elif command == '4':
                ser.write(b'4\n')  # Send command '4' (as bytes)
            elif command[:2] == '5 ':	# Note: Doesn't validate the second integer
                ser.write(f"{command}\n".encode())  # Send command (as bytes)
            elif command[:2] == '6 ': # Note: Doesn't validate the second integer
                ser.write(f"{command}\n".encode())  # Send command (as bytes)
            elif command == '7':
                ser.write(b'7\n')  # Send command '7' (as bytes)
            else:
                print("Invalid command! Please enter '1', '2', '3', '4', '5 n', '6 n' or '7'.")

    except KeyboardInterrupt:
        print("\nProgram stopped by user.")

    # Close serial port
    ser.close()
else:
    print("No Arduino detected")
