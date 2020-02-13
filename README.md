# connectivity-events
Emits events on system wakeup or network status changes.

By default, the timer that's used for polling `os.networkInterfaces()` is unref'd, so it won't keep your process alive.

### Installation
```
> npm i connectivity-events --save
```

### Usage
```js
const ConnectivityMonitor = require('connectivity-events')
const connectivity = new ConnectivityMonitor()

connectivity.on('change', () => { ... }) // Emitted whenever connectivity state changes.

// After you're done listening for events.
connectivity.destroy()
```

### API
#### `const monitor = new ConnectivityMonitor(opts = {})`
Start listening for connectivity events.

Options include:
```js
{
  interval: 10000 // The default polling interval.
  noUnref: false  // Don't unref the timer.
}
```

#### `monitor.on('change', () => { ... })`
Emitted whenever your computer's connectivity state has changed.

This will also be emitted when your computer wakes up after being suspended.

#### `monitor.destroy()`
Stop listening for network changes.

### License
MIT
