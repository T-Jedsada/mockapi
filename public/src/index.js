var event = require('event')
var Form = require('./form')
var Routes = require('./routes')
var Base64 = require('js-base64').Base64;
var Notice = require('notice')
var filePicker = require('file-picker')
var request = require('request')

var routes = new Routes(document.querySelector('.left-panel'))
var form = new Form(document.querySelector('.right-panel'))

routes.on('active', function (li) {
  var route = li.querySelector('.text').textContent
  form.load(route)
})

form.on('save', function (route) {
  var id = Base64.encode(route)
  if (routes.hasItem(route)) {
    routes.active(id, false)
  } else {
    routes.addItem(route, true)
    routes.active(id, false)
  }
})

routes.on('empty', function () {
  form.empty()
})

event.bind(document.getElementById('import'), 'click', function (e) {
  filePicker(function(files){
    var file = files[0]
    var reader = new FileReader()
    reader.onload = function (e) {
      try {
        var obj = JSON.parse(reader.result)
      } catch(e) {
        new Notice('not valid json file', {
          type: 'error'
        })
      }
      importApis(obj)
    }
    reader.readAsText(file)
  })
})

function importApis(data) {
  request
    .post('/_importapi')
    .type('json')
    .accept('json')
    .send(data)
    .end(function (res) {
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
        window.location.reload()
      }
    })
}

event.bind(document, 'keydown', function (e) {
  if (e.keyCode == 83 && e.metaKey) {
    e.preventDefault()
    form.save()
  }
})
