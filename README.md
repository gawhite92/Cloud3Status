# Cloud3Status

Tray application for HyperX Cloud3 Headset

Quick visual reference for certain headset features - battery, mic & sidetone status. I found the official HyperX app to be a bit busy and wanted to try make something more basic to suit my personal needs.

Also a few firsts for me:

- trying to reverse engineer a software / hardware product.
- sniffing USB packets using Wireshark.
- programming a desktop app using Electron - previously only web based applications.

Still to do:

- Send status requests to device COMPLETE (Only issue is volume/mute status. Not really needed, though could maybe just read this from windows volume instead.)
- Make tray icon update with status changes. COMPLETE
- Add buttons COMPLETE
- Package in .exe for easier install COMPLETE (Electron Forge)

- Add Windows notifications
- Make nicer UI. Conditional colours for each status

Credits:
Node HID: https://www.npmjs.com/package/node-hid
Test tray icon: https://www.flaticon.com/free-icons/cloud - Cloud icons created by Alfredo Hernandez - Flaticon
https://www.wireshark.org/
