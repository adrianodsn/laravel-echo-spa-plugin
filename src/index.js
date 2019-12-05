import Echo from 'laravel-echo'

const socketServer = process.env.ECHO_HOST
const logger = process.env.DEV
  ? (level, ...messages) => console[level]('[Echo]', ...messages)
  : () => {}


export const createPlugin = function () {
  const $echo = {
    _echo: null,
    _readyCallbacks: [],
    _scriptLoaded: false,
    _initOnScriptLoaded: false,
    _token: null,
    loadScript () {
      const SCRIPT_TAG_ID = 'echo-socket'
      if (window.io) {
        this._scriptLoaded = true
        return
      }
      if (this._scriptLoaded || document.getElementById(SCRIPT_TAG_ID)) {
        return
      }

      const scriptTag = document.createElement('script')
      scriptTag.onload = () => {
        logger('log', 'Socket.io script loaded')
        this._scriptLoaded = true
        if (this._initOnScriptLoaded) {
          this.connect()
        }
      }
      scriptTag.async = true
      scriptTag.src = `${socketServer}/socket.io/socket.io.js`
      scriptTag.id = SCRIPT_TAG_ID
      document.head.appendChild(scriptTag)
    },
    close () {
      this._token = null
      if (this._echo) {
        logger('log', 'Closing connection')
        this._echo.disconnect()
      }
      this._echo = null
    },
    connect () {
      try {
        this._connect()
      } catch (e) {
        logger('error', e)
      }
    },
    setToken (token) {
      this._token = token
    },
    _connect () {
      if (this._echo) {
        return
      }
      if (!this._scriptLoaded) {
        this._initOnScriptLoaded = true
        return
      }

      this._echo = new Echo({
        broadcaster: 'socket.io',
        host: socketServer,
        authEndpoint: process.env.ECHO_AUTH_ENDPOINT,
        auth: {
          headers: {
            Authorization: this._token
          }
        }
      })

      logger('info', 'Echo started')
      this._readyCallbacks.forEach(cb => cb($echo._echo))
      this._readyCallbacks = []
    },
    onEchoReady (callback) {
      if (this._echo) {
        callback(this._echo)
      } else {
        this._readyCallbacks.push(callback)
      }
    },
    get echo () {
      return this._echo
    }
  }

  return $echo
}


export const registerAxiosInterceptor = function ($axios) {
  $axios.interceptors.request.use(function (config) {
    const sid = $echo.echo ? $echo.echo.socketId() : null
    if (sid) {
      config.headers['X-Socket-ID'] = sid
    }
    return config
  })
}