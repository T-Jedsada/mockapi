/*global CodeMirror*/
var event = require('event')
var request = require('request')
var Notice = require('notice')
var Emitter = require('emitter')
var Nprogress = require('nprogress')

var editor = CodeMirror.fromTextArea(document.getElementById('content'), {
  tabsize: 2,
  autofocus: true,
  lineNumbers: true,
  matchBrackets: true,
  lineWrapping: true,
  scrollbarStyle: 'simple'
})

function Panel(root) {
  this.root = root
  this.input = this.root.querySelector('[name="route"]')
  var save = this.root.querySelector('.save')
  event.bind(save, 'click', this.save.bind(this))
}

Emitter(Panel.prototype)

Panel.prototype.save = function () {
  var route = this.input.value
  if (!route) {
    new Notice('route should not be empty', {
      type: 'error'
    })
    return
  }
  if (!/^(GET|POST|PUT|DELETE|PATCH)\s/.test(route)) {
    new Notice('Need GET/POST/PUT/DELETE/PATH method', {
      type: 'error'
    })
    return
  }
  if (/^\w+\shttp/.test(route)) {
    var method = route.match(/^\w+/)[0]
    route = method + ' '+ parseUrl(route.replace(method, ''))
    this.input.value = route
  } else if (!/\w+\s\//.test(route)) {
    new Notice('Invalid request url', {
      type: 'error'
    })
    return
  }
  var content = editor.getValue()
  var self = this
  Nprogress.start()
  request
    .post('/_addapi')
    .type('form')
    .accept('json')
    .send({route: route, content: content})
    .end(function (res) {
      Nprogress.done()
      if (res.error) {
        if (res.body && res.body.error) {
          new Notice(res.body.error, {
            type: 'error'
          })
        } else {
          new Notice('request error ' + res.status, {
            type: 'error'
          })
        }
      } else {
        new Notice('Saved：' + route, {
          type: 'success',
          duration: 2000
        })
        self.emit('save', route)
      }
    })
}

Panel.prototype.load = function (route) {
  Nprogress.start()
  var parts = route.split(' ')
  var self = this
  request(parts[0], parts[1])
    .end(function (res) {
      Nprogress.done()
      if (res.error) {
        if (res.body && res.body.error) {
          new Notice(res.body.error, {
            type: 'error'
          })
        } else {
          new Notice('request error ' + res.status, {
            type: 'error'
          })
        }
      } else {
        self.input.value = route
        editor.setValue(res.text)
      }
    })
}

Panel.prototype.empty = function () {
  this.input.value = ''
  editor.setValue('')
}

function parseUrl(url) {
  var parser = document.createElement('a')
  parser.href = url
  return parser.pathname + parser.search
}

module.exports = Panel
