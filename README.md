# Cloud3Status

What is it?
Tray application for HyperX Cloud3 Headset

Why?
I wanted a quick visual reference for certain headset features - battery status, mic mute status. I found the official HyperX app to be a bit busy and wanted to try make something more basic to suit my personal needs.

Also a few firsts for me:

- trying to reverse engineer a software / hardware product.
- sniffing USB packets using Wireshark.
- programming a desktop app using Electron - previously only web based applications.

Still to do:

- Send status requests to device COMPLETE (Only issue is volume/mute status. Not really needed, though could maybe just read this from windows volume instead.)
- Make tray icon update with status changes. COMPLETE

- Add Windows notifications
- Make GUI nicer.
- Package in .exe for easier install.

Credits:
Node HID: https://www.npmjs.com/package/node-hid
Test tray icon: https://www.flaticon.com/free-icons/cloud - Cloud icons created by Alfredo Hernandez - Flaticon
https://www.wireshark.org/
