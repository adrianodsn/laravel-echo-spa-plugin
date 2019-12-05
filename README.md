# Laravel Echo SPA Module
A library to simplify the integration of Laravel Echo with your SPA/PWA

# Setup
```
yarn add laravel-echo-spa-plugin
```

Define env variables for your application
```js
  env: {
    ECHO_AUTH_ENDPOINT: '/api/broadcasting/auth',
    ECHO_HOST: 'http://echo-demo.test'
  }
```

# Usage
```js
import { createPlugin } from 'laravel-echo-spa-plugin'

const $echo = createPlugin()

// load 'socket.io.js' dynamically if 'window.io' is not defined
// no PROMISE is returned!
// register your callbacks using $echo.onEchoReady
$echo.loadScript()

$echo.onEchoReady((echo) => {
  // this is the Laravel Echo Instance
  echo.private('room')
    .listen(...)
  // it can be accessed by $echo.echo
  console.log(echo === $echo.echo) // true
})

// add token if you need private channels
$echo.setToken('AUTH_TOKEN_FOR_PRIVATE_CHANNELS')

// connect, this method will wait for the setup method to completes
$echo.connect()

// you can access the echo instance directly
$echo.echo.private('room')
  .listen(...)

...

// shutdown the echo instance
$echo.close()
// you can reconnect later
$echo.connect()
```
# Nuxt.js Example
```js
// ~/plugins/echo.js
import Vue from 'vue'
import { createPlugin, registerAxiosInterceptor } from 'laravel-echo-spa-plugin'

export default function({ app, $axios }) {
  const $echo = createPlugin()
  Vue.prototype.$echo = app.$echo = $echo

  // Support broadcasting to others for axios
  if ($axios) {
    registerAxiosInterceptor($axios)
  }
}

// nuxt.config.js
{
  env: {
    ECHO_AUTH_ENDPOINT: '/api/broadcasting/auth',
    ECHO_HOST: 'http://echo-demo.test'
  },

  plugins: [
    '~/plugins/echo'
  ],
}
```