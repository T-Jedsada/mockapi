var radio = require('radio')
var Notice = require('notice')
var request = require('request')
var Emitter = require('emitter')
var classes = require('classes')
var event = require('event')
var delegate = require('delegate')
var closest = require('closest')
var transitionEnd = require('transitionend-property')
var spin = require('spin')
var domify = require('domify')
var template = require('./item.html')
var Base64 = require('js-base64').Base64
var Sortable = require('sweet-sortable')

function Routes(root) {
  var search = root.querySelector('.search')
  this.root = root
  this.list = document.querySelector('#routes > ul')
  event.bind(search, 'input', this.filter.bind(this))
  delegate.bind(this.list, '.close', 'click', this.removeItem.bind(this))
  delegate.bind(this.list, '.item', 'click', this.activeItem.bind(this))
  this.loadItems()
  var sortable = new Sortable(this.list)
  sortable.bind('li')
  sortable.on('update', this.saveOrder.bind(this))
}

Emitter(Routes.prototype)

Routes.prototype.saveOrder = function () {
}

Routes.prototype.loadItems = function () {
  var s = spin(this.root)
  var self = this
  request
    .get('/_listapi')
    .end(function (res) {
      s.remove()
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
        var keys = res.body.keys
        keys.forEach(function (key) {
          self.addItem(key)
        })
        var li = self.list.querySelector('li:first-child')
        if (li) self.active(li, true)
      }
    })
}

Routes.prototype.addItem = function (route, prepend) {
  var el = domify(template.replace('{{route}}', route))
  el.setAttribute('data-id', Base64.encode(route))
  if (prepend) {
    if (this.list.children.length) {
      this.list.insertBefore(el, this.list.firstElementChild)
    } else {
      this.list.appendChild(el)
    }
  } else {
    this.list.appendChild(el)
  }
}

Routes.prototype.hasItem = function (route) {
  var id = Base64.encode(route)
  return this.list.querySelector('[data-id="' + id + '"]') != null
}

Routes.prototype.filter = function (e) {
  var val = e.target.value
  var lis = [].slice.call(this.list.querySelectorAll('li'))
  lis.forEach(function (li) {
    var text = li.textContent
    if (val == '' || text.indexOf(val) !== -1) {
      li.style.display = 'block'
    } else {
      li.style.display = 'none'
    }
  })
}

Routes.prototype.removeItem = function (e) {
  var li = closest(e.target, 'li')
  if (classes(li).has('removing')) return
  e.stopPropagation()
  e.preventDefault()
  classes(li).add('removing')
  var route = li.querySelector('.text').textContent
  var self = this
  request
    .del('/_deleteapi')
    .query({route: route})
    .end(function (res) {
      if (res.error) {
        if (res.body.error) {
          new Notice(res.body.error, {
            type: 'error'
          })
        } else {
          new Notice('request error ' + res.status, {
            type: 'error'
          })
        }
      } else {
        new Notice('Removed: ' + route, {
          type: 'success',
          duration: 2000
        })
        self.emit('remove', route)
        event.bind(li, transitionEnd, function () {
          if (li.parentNode) li.parentNode.removeChild(li)
        })
        classes(li).add('remove')
        if (self.list.children.length === 1) {
          return self.emit('empty')
        }
        if (classes(li).has('active')) {
          var lis = self.list.children
          for (var i = 0, l = lis.length; i < l; i++) {
            if (!classes(lis[i]).has('removing')) {
              self.active(lis[i], true)
              break;
            }
          }
        }
      }
    })
}

Routes.prototype.active = function (li, emit) {
  if (typeof li === 'string') {
    li = this.list.querySelector('[data-id="'+li+'"]')
    if (!li) throw new Error('not found ' + li)
  }
  if (classes(li).has('active')) return
  radio(li)
  if (emit) {
    this.emit('active', li)
  }
}

Routes.prototype.activeItem = function (e) {
  var li = closest(e.target, 'li')
  if (e.defaultPrevented) return
  if (!li) return
  this.active(li, true)
}

module.exports = Routes
