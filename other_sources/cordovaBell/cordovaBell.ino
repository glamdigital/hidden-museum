#include <Adafruit_Soundboard.h>

// Include BLE files.
#include <SPI.h>
#include <boards.h>
#include <SoftwareSerial.h>
#include <RBL_nRF8001.h>
#include <services.h>
#include "Boards.h"

// Define input/output pins
#define INPUT_PIN A1 
#define LED_PIN 13
#define AUDIO_RESET A0  // "Rst" on Audio FX

Adafruit_Soundboard sfx(&Serial1, NULL, AUDIO_RESET);

// This function is called only once, at reset.
void setup()
{
	// Enable serial debug.
	Serial.begin(57600);

	// Enable output.
	pinMode(LED_PIN, OUTPUT);

	// Turn off LED.
	digitalWrite(LED_PIN, LOW);

	// Writing to an analog input pin sets baseline for later input.
	digitalWrite(INPUT_PIN, HIGH);

	// Default pins set to 9 and 8 for REQN and RDYN
	// Set your REQN and RDYN here before ble_begin() if you need
	//ble_set_pins(3, 2);

	// Initialize BLE library.
	ble_begin();

	// Set a custom BLE name.
	//ble_set_name("arduinoble");

	// Turn off LED.
	digitalWrite(LED_PIN, LOW);

        // Set up serial for soundboard
        Serial1.begin(9600);
        
        sfx.reset(); //digitalWrite(LED_PIN, HIGH);
}

// This function is called continuously, after setup() completes.
void loop()
{
	// If there's any input...
	while (ble_available())
	{
		// Read input.
		int c = ble_read();
		if (c != 0)
		{
                        sfx.playTrack("T00     WAV");
                        digitalWrite(LED_PIN, HIGH);
                        delay(500);
                        digitalWrite(LED_PIN, LOW);
		}
		else
		{
			// Input value zero means "turn off LED".
			digitalWrite(LED_PIN, LOW);
		}
	}

	// Process BLE events.
	ble_do_events();
}
