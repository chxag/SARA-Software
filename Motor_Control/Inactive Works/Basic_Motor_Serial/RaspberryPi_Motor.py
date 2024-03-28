import serial
import time

# List of possible port names to try
possible_ports = ['/dev/ttyACM0', '/dev/ttyACM1']

# Try opening each port until one works
for port in possible_ports:
    try:
        ser = serial.Serial(port, 9600)
        print(f"Connected to {port}")
        break
    except serial.SerialException:
        print(f"Failed to connect to {port}")

if 'ser' in locals():
    try:
        while True:
            # Ask the user for a command
            command = input("Enter command (1/2) or 'q' to quit: ")

            # Send the command if it's '1' or '2'
            if command == '1':
                ser.write(b'1')  # Send command '1' (as bytes)
            elif command == '2':
                ser.write(b'2')  # Send command '2' (as bytes)
            elif command.lower() == 'q':
                break  # Quit the loop if the command is 'q'
            else:
                print("Invalid command! Please enter '1', '2', or 'q'.")

            # Read serial feedback from Arduino with timeout
            serial_feedback = ser.readline().decode().strip()
            start_time = time.time()
            while not serial_feedback:
                if time.time() - start_time > 5000:  # Timeout after 5 seconds
                    print("Timeout: No serial feedback received.")
                    break
                serial_feedback = ser.readline().decode().strip()
            
            if serial_feedback:
                print("Serial Feedback:", serial_feedback)

            # Add a delay to allow time for the Arduino to process the command
            time.sleep(1)

    except KeyboardInterrupt:
        print("\nProgram stopped by user.")

    # Close serial port
    ser.close()
else:
    print("No Arduino detected")
