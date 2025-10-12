const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } = require('electron/main');
const path = require('node:path')

const HID = require('node-hid');

let mainWindow;
let tray;

function createTray() {
    // 1. Load the icon
    const iconPath = path.join(__dirname, 'assets', 'icon.png'); // Replace with your icon path
    const icon = nativeImage.createFromPath(iconPath);

    // 2. Create a new Tray instance
    tray = new Tray(icon);
    tray.setContextMenu(createTrayMenu('...', '...', '...', '...', '...')); // Initial menu

    // 4. Set the tooltip and context menu for the tray
    tray.setToolTip(`Cloud3Status`);

    // Optional: Toggle window on tray icon click
    tray.on('click', () => {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            mainWindow.show();
        }
    });
}

function createTrayMenu(power, battery, mic, sidetone, mute) {
    const template = [
        { label: `Power: ${power} ` },
        { label: `Battery: ${battery}` },
        { label: `Mic: ${mic}` },
        { label: `Sidetone: ${sidetone}` },
        { label: `Muted: ${mute}` },
        { label: 'Show App:', click: () => mainWindow.show() },
        { label: 'Quit App', click: () => app.quit() },
    ];
    return Menu.buildFromTemplate(template);
}

function updateTrayIcon(imagename) {
    const newIconPath = path.join(__dirname, `path/to/your/${imagename}.png`);
    tray.setImage(newIconPath);
}

function createWindow() {
    // Create the main browser window
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile('index.html');
    // mainWindow.removeMenu();
    createTray();
}

app.whenReady().then(() => {
    createWindow();

    mainWindow.on('minimize', (event) => {
        // event.preventDefault();
        mainWindow.hide();
    });
});

const updateText = (channel, text) => {
    mainWindow.webContents.send(channel, text);
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// List all connected HID devices
const devices = HID.devices();
// console.log("Available HID devices:", devices);

// Find a specific device (e.g., by vendorId and productId)
const myDevice = devices.find(d => d.vendorId === 0x03f0 && d.productId === 0x05b7);

let mic;
let sidetone;
let battery;
let mute;
let power;

if (myDevice) {
    const device = new HID.HID(myDevice.path);
    console.log("Connected to HID device:", myDevice.product);

    // Example: Listen for input reports
    device.on("data", function (data) {
        // console.log(data)
        const dataobject = data.toJSON()
        // console.log(dataobject)
        messageID = dataobject.data[1]
        micIndicator = dataobject.data[2]
        sidetoneIndicator = dataobject.data[2]
        batteryIndicator = dataobject.data[4]
        muteIndicator = dataobject.data[2]

        // console.log("Message ID: ", messageID)
        // console.log("Mic Indicator: ", micIndicator)
        // console.log("Battery Indicator: ", batteryIndicator)
        // console.log("Mute Indicator", muteIndicator)


        if (messageID == 137) {
            if (batteryIndicator != 0) {
                console.log(`Battery is currently ${batteryIndicator} percent.`)
                updateText('batterystatus', `Battery is currently ${batteryIndicator} percent.`)
                battery = batteryIndicator;
            }
        }

        if (messageID == 10) {
            if (micIndicator == 0) {
                console.log("Microphone is active.")
                updateText('micstatus', "Microphone is active.")
                mic = "Active"
            } else {
                console.log("Microphone is muted.")
                updateText('micstatus', "Microphone is muted.")
                mic = "Muted"
            }
        }

        if (messageID == 9) {
            if (sidetoneIndicator == 1) {
                console.log("Sidetone active.")
                updateText('sidetonestatus', "Sidetone active.")
                sidetone = "On";
            } else {
                console.log("Sidetone disabled.")
                updateText('sidetonestatus', "Sidetone disabled.")
                sidetone = "Off";
            }
        }

        if (messageID == 14) {
            if (muteIndicator == 1) {
                console.log("Headset muted.")
                updateText('mutestatus', "Headset muted.")
                mute = "Muted";
            } else {
                console.log("Headset unmuted.")
                updateText('mutestatus', "Headset unmuted.")
                mute = "Unmuted";
            }
        }

        if (messageID == 131) {
            console.log("Turned headset on.")
            updateText('powerstatus', "Turned headset on.")
            power = 'On';
        }

        if (messageID == 8) {
            console.log("Turned headset off.")
            updateText('powerstatus', "Turned headset off.")
            power = 'Off';
        }
        tray.setContextMenu(createTrayMenu(power, battery, mic, sidetone, mute));

    },)


    // Example: Send an output report
    // device.write([0x01, 0x02, 0x03]); // Replace with your report data

    // Close the device when done
    // device.close();
} else {
    console.log("Target HID device not found.");
    updateText("Target HID device not found.");
}