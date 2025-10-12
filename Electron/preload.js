const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    updatePowerStatus: (callback) => ipcRenderer.on('powerstatus', (event, ...args) => callback(...args)),
    updateBatteryStatus: (callback) => ipcRenderer.on('batterystatus', (event, ...args) => callback(...args)),
    updateMicStatus: (callback) => ipcRenderer.on('micstatus', (event, ...args) => callback(...args)),
    updateMuteStatus: (callback) => ipcRenderer.on('mutestatus', (event, ...args) => callback(...args)),
    updateSidetoneStatus: (callback) => ipcRenderer.on('sidetonestatus', (event, ...args) => callback(...args)),
});