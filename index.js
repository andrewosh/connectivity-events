const os = require('os')
const { EventEmitter } = require('events')

const INTERVAL = 1000 * 10

class ConnectivityMonitor extends EventEmitter {
  constructor (opts = {}) {
    super()

    this._interval = opts.interval || INTERVAL
    this._lastPoll = 0
    this._lastState = []

    this._timer = setInterval(() => {
      const currentTime = Date.now()
      const currentState = getCidrs()

      const isWakingUp = (currentTime - this._lastPoll) > INTERVAL * 2
      if (isWakingUp) {
        this._lastPoll = currentTime
        this._lastState = []
        return
      }

      const isDifferentState = !equalArray(currentState, this._lastState)
      if (isDifferentState) this.emit('change')

      this._lastPoll = currentTime
      this._lastState = currentState
    }, this._interval)
    if (opts.noUnref !== true) this._timer.unref()
  }
  
  destroy () {
    if (this._timer) clearInterval(this._timer)
    this._timer = null
  }
}

module.exports = ConnectivityMonitor

function getCidrs () {
  const all = []
  const faces = os.networkInterfaces()
  for (const name of Object.keys(faces)) {
    for (const i of faces[name]) {
      if (!i.internal) all.push(i.cidr)
    }
  }
  return all
}

function equalArray (a, b) {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

if (require.main === module) {
  const monitor = new ConnectivityMonitor({ interval: 1000, noUnref: true })
  monitor.on('change', () => { console.log('connectivity changed') })
  process.on('SIGINT', () => monitor.destroy())
}
