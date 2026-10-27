# Preview on an iPhone from Windows

This is a browser preview for checking touch, layout and the first-session experience. It is not a signed Capacitor iOS build, does not prove native haptics or lifecycle behavior, and may behave differently from the installed app. Safari stores progress separately from the native app; use a disposable test save.

1. On the Windows PC, install dependencies with `npm ci` and create the current web build with `npm run build`.
2. Connect the iPhone and PC to the same trusted Wi-Fi network. Find the PC's Wi-Fi IPv4 address using `ipconfig`.
3. Start the preview bound to that address, for example `npm run preview -- --host 192.168.1.100 --port 4199 --strictPort`, substituting the actual Wi-Fi address. Keep the terminal and PC awake while testing. Stop the preview with Ctrl+C when finished.
4. On the iPhone, open `http://<PC Wi-Fi address>:4199/` in Safari. If it does not load, check the address, Wi-Fi network, firewall and whether the router isolates clients. Ask the PC owner before changing firewall settings. A VPN, guest network or a change in IP address can affect connectivity.
5. Use [the playtest protocol](PLAYTEST_IPHONE.md) for observations. Record the build commit and that this was Safari, not the native app. Avoid entering private information in a test save.

A plain HTTP LAN preview is not a secure context; clipboard, service-worker/offline support and other browser APIs may be unavailable. A later native build still requires access to a macOS/Xcode build and Apple's signing/distribution setup, followed by testing on the actual iPhone.
