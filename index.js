const os = require('os')
const equal = require('fast-deep-equal')
const { EventEmitter } = require('events')

const INTERVAL = 1000 * 10

class ConnectivityMonitor extends EventEmitter {
  constructor (opts = {}) {
    super()

    this._interval = opts.interval || INTERVAL
    this._lastPoll = null
    this._lastNetworkState

    this._timer = setInterval(() => {
      const self = this
      var currentTime = Date.now()
      var currentState = this._filterInterfaces(os.networkInterfaces())

      const isWakingUp = (currentTime - this._lastPoll) > INTERVAL * 2
      const isDifferentState = !equal(currentState, this._lastState)
      if (isWakingUp || isDifferentState) this.emit('change')

      self._lastPoll = currentTime
      self._lastState = currentState
    }, this._interval)
    if (opts.noUnref !== true ) this._timer.unref()
  }

  _filterInterfaces (networkInterfaces) {
    const filtered = {}
    for (const name of Object.keys(networkInterfaces)) {
      const iface = networkInterfaces[name]
      if (iface.internal) continue
      filtered[name] = iface
    }
    return filtered
  }

  destroy () {
    if (this._timer) clearInterval(this._timer)
    this._timer = null
  }
}
module.exports = ConnectivityMonitor

if (require.main === module) {
  const monitor = new ConnectivityMonitor({ interval: 1000, noUnref: true })
  monitor.on('change', () => { console.log('connectivity changed') })
  process.on('SIGINT', () => monitor.destroy())
}
