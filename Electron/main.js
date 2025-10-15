const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } = require('electron/main');
const path = require('node:path')

const HID = require('node-hid');

let mainWindow;
let tray = null;

function createTray(iconpath) {
    const iconPath = path.join(__dirname, 'assets', `${iconpath}.png`); // Replace with your icon path
    const icon = nativeImage.createFromPath(iconPath);

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

const red = nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACTSURBVHgBpZKBCYAgEEV/TeAIjuIIbdQIuUGt0CS1gW1iZ2jIVaTnhw+Cvs8/OYDJA4Y8kR3ZR2/kmazxJbpUEfQ/Dm/UG7wVwHkjlQdMFfDdJMFaACebnjJGyDWgcnZu1/lrCrl6NCoEHJBrDwEr5NrT6ko/UV8xdLAC2N49mlc5CylpYh8wCwqrvbBGLoKGvz8Bfq0QPWEUo/EAAAAASUVORK5CYII=')
const green = nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACOSURBVHgBpZLRDYAgEEOrEzgCozCCGzkCbKArOIlugJvgoRAUNcLRpvGH19TkgFQWkqIohhK8UEaKwKcsOg/+WR1vX+AlA74u6q4FqgCOSzwsGHCwbKliAF89Cv89tWmOT4VaVMoVbOBrdQUz+FrD6XItzh4LzYB1HFJ9yrEkZ4l+wvcid9pTssh4UKbPd+4vED2Nd54iAAAAAElFTkSuQmCC')

function createTrayMenu(power, battery, mic, sidetone) {
    return Menu.buildFromTemplate([
        { label: `Power: ${power} ` },
        {
            label: `Battery: ${battery}`, type: 'checkbox', click: ({ checked }) => {
                checked ? tray.setImage(green) : tray.setImage(red)
            }
        },
        { label: `Mic: ${mic}` },
        { label: `Sidetone: ${sidetone}` },
        // { label: `Volume: ${mute}` },
        { type: 'separator' },
        { label: 'Show App', click: () => mainWindow.show() },
        {
            label: 'Quit App', click: () => {
                // mainWindow.destroy();
                // mainWindow = null;
                app.isQuiting = true;
                console.log('app.isQuiting: ', app.isQuiting)
                app.quit();
            }
        },
    ]);
}

// function updateTrayIcon(imagename) {
//     const newIconPath = path.join(__dirname, `path/to/your/${imagename}.png`);
//     tray.setImage(newIconPath);
// }

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 260,
        height: 350,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile('index.html');
    mainWindow.removeMenu();
}

app.whenReady().then(() => {
    createWindow();
    createTray('icon');

    mainWindow.on('close', function (event) {
        if (!app.isQuiting) {
            console.log('app.isQuiting: ', app.isQuiting)
            console.log('Preventing app from quiting')
            event.preventDefault();
            mainWindow.hide();
        }
    });

    mainWindow.on('minimize', (event) => {
        console.log('Minimising to tray')
        event.preventDefault();
        mainWindow.hide();
    });
});


const updateText = (channel, text) => {
    mainWindow.webContents.send(channel, text);
}

const devices = HID.devices();
// console.log("Available HID devices:", devices);

const myDevice = devices.find(d => d.vendorId === 0x03f0 && d.productId === 0x05b7);

let mic = "Off";
let sidetone = "Off";
let battery = "0%";
// let mute = "Muted";
let power = "Off";

function requestInfo(device) {
    console.log('Requesting device status')
    let dataBufferCodes = [0x8f, 0x82, 0x89, 0x84, 0x85, 0x86, 0x8a, 0x83]

    // IN DECIMAL BELOW:
    // 102 is first number
    // 143, 130, 137, 132, 133, 134, 138, 131

    for (let i = 0; i < dataBufferCodes.length; i++) {
        let dataBuffer = new Buffer.alloc(62)
        dataBuffer[0] = 0x66
        dataBuffer[1] = dataBufferCodes[i]
        device.write(dataBuffer);
    }
}

function sendCommand(device, type, onoff) {
    let dataBuffer = new Buffer.alloc(62);
    dataBuffer[0] = 0x66
    const onOffHex = onoff.toString(16);

    console.log(type);
    switch (type) {
        case "mic": {
            dataBuffer[1] = 0x3
            mic == "Off" ? dataBuffer[2] = 0x0 : dataBuffer[2] = 0x1
            break;
        }
        case "sidetone": {
            dataBuffer[1] = 0x1
            sidetone == "Off" ? dataBuffer[2] = 0x1 : dataBuffer[2] = 0x0
            break;
        }
    }
    console.log('Sending command')
    device.write(dataBuffer);
    console.log('Sent buffer: ', dataBuffer)
}

if (myDevice) {
    const device = new HID.HID(myDevice.path);
    console.log("Connected to HID device:", myDevice.product);

    // Example: Listen for input reports
    device.on("data", function (data) {
        // console.log(data)
        // console.log("Length: ", data.length)
        const dataobject = data.toJSON()
        console.log("Response: ",
            // dataobject.data[0].toString(16),
            // dataobject.data[1].toString(16),
            // dataobject.data[2].toString(16),
            // dataobject.data[3].toString(16),
            // dataobject.data[4].toString(16),
            // dataobject.data[5].toString(16),
            // dataobject.data[6].toString(16),
            // "-----------------",
            dataobject.data[0],
            dataobject.data[1],
            dataobject.data[2],
            dataobject.data[3],
            dataobject.data[4],
            dataobject.data[5],
            dataobject.data[6])
        messageID = dataobject.data[1]
        trueFalseIndicator = dataobject.data[2]
        volumeMuteIndicator = dataobject.data[3]
        batteryLevelIndicator = dataobject.data[4]

        if (messageID == 137 || messageID == 13) {
            if (batteryLevelIndicator != 0) {
                updateText('batterystatus', `Battery: ${batteryLevelIndicator}%`)
                battery = batteryLevelIndicator;
            }
        }

        if (messageID == 10 || messageID == 134) {
            if (trueFalseIndicator == 0) {
                updateText('micstatus', "Mic: On")
                mic = "On"
            } else {
                updateText('micstatus', "Mic: Off")
                mic = "Off"
            }
        }

        if (messageID == 9 || messageID == 132) {
            if (trueFalseIndicator == 1) {
                updateText('sidetonestatus', "Sidetone: On")
                sidetone = "On";
            } else {
                updateText('sidetonestatus', "Sidetone: Off")
                sidetone = "Off";
            }
        }

        // if (messageID == 14) {
        //     if (trueFalseIndicator == 1) {
        //         updateText('mutestatus', "Sound: Off")
        //         mute = "Muted";
        //     } else {
        //         updateText('mutestatus', "Sound: On")
        //         mute = "Unmuted";
        //     }
        // }

        // if (messageID == 137) {
        //     if (volumeMuteIndicator == 88) {
        //         updateText('mutestatus', "Sound: Muted")
        //         mute = "Muted";
        //     } else if (volumeMuteIndicator == 89) {
        //         updateText('mutestatus', "Sound: Active")
        //         mute = "Unmuted";
        //     }
        // }


        if (messageID == 130) {
            if (trueFalseIndicator == 1) {
                updateText('powerstatus', "Power: On")
                power = 'On';
            } else {
                updateText('powerstatus', "Power: Off")
                power = 'Off';
            }
        }

        if (messageID == 8) {
            updateText('powerstatus', "Power: Off")
            power = 'Off';
        }

        // console.log(power, battery, mic, sidetone, mute)
        if (messageID == 8 || messageID == 9 || messageID == 10 || messageID == 13 || messageID == 14 || messageID == 130 || messageID == 132 || messageID == 134 || messageID == 137) {
            console.log('Refreshing tray')
            tray.setContextMenu(createTrayMenu(power, battery, mic, sidetone));
        }
    },)

    setTimeout(() => {
        requestInfo(device);
    }, 1000);

    ipcMain.on('button-clicked', (event, message) => {
        console.log('Message from renderer:', message);
        sendCommand(device, message, 0);
        // Perform main process operations here
    });

    // Close the device when done
    // device.close();
} else {
    console.log("Target HID device not found.");
    updateText("Target HID device not found.");
}