window.electronAPI.updatePowerStatus((message) => {
    document.getElementById('power-display').innerText = message;
});

window.electronAPI.updateBatteryStatus((message) => {
    document.getElementById('battery-display').innerText = message;
});

window.electronAPI.updateMicStatus((message) => {
    document.getElementById('mic-display').innerText = message;
});

window.electronAPI.updateMuteStatus((message) => {
    document.getElementById('mute-display').innerText = message;
});

window.electronAPI.updateSidetoneStatus((message) => {
    document.getElementById('sidetone-display').innerText = message;
});