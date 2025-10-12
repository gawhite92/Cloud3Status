// index.js
const HID = require('node-hid');

// List all connected HID devices
const devices = HID.devices();
// console.log("Available HID devices:", devices);

// Find a specific device (e.g., by vendorId and productId)
const myDevice = devices.find(d => d.vendorId === 0x03f0 && d.productId === 0x05b7);

if (myDevice) {
    const device = new HID.HID(myDevice.path);
    console.log("Connected to HID device:", myDevice.product);

    // Example: Listen for input reports
    device.on("data", function (data) {
        // console.log(data)
        const dataobject = data.toJSON()
        // console.log(dataobject)
        const messageID = dataobject.data[1]
        const micIndicator = dataobject.data[2]
        const sidetoneIndicator = dataobject.data[2]
        const batteryIndicator = dataobject.data[4]
        const muteIndicator = dataobject.data[2]

        // console.log("Message ID: ", messageID)
        // console.log("Mic Indicator: ", micIndicator)
        // console.log("Battery Indicator: ", batteryIndicator)
        // console.log("Mute Indicator", muteIndicator)


        if (messageID == 137) {
            if (batteryIndicator != 0) {
                console.log(`Battery is currently ${batteryIndicator} percent.`)
            }
        }

        if (messageID == 10) {
            if (micIndicator == 0) {
                console.log("Microphone is active.")
            } else {
                console.log("Microphone is muted.")
            }
        }

        if (messageID == 9) {
            if (sidetoneIndicator == 1) {
                console.log("Sidetone active.")
            } else {
                console.log("Sidetone disabled.")
            }
        }

        if (messageID == 14) {
            if (muteIndicator == 1) {
                console.log("Headset muted.")
            } else {
                console.log("Headset unmuted.")
            }
        }

        if (messageID == 131) {
            console.log("Turned headset on.")
        }

        if (messageID == 8) {
            console.log("Turned headset off.")
        }
    },)

    // Example: Send an output report
    // device.write([0x01, 0x02, 0x03]); // Replace with your report data

    // Close the device when done
    // device.close();
} else {
    console.log("Target HID device not found.");
}