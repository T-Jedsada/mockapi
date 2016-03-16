var config = require('./config.json')
var redisClient = require('redis').createClient(config.redis.port, config.redis.host)
var parse = require('co-body')
var cors = require('koa-cors')
var wrapper = require('co-redis')
var redisCo = wrapper(redisClient)
var liveload = require('koa-liveload')
var koa = require('koa')
var app = koa()
var router = require('koa-router')()

router.get('/_listapi', function* (next) {
  var data = yield redisCo.hkeys('apis')
  this.type = 'json'
  this.body = {keys: data || []}
})

router.delete('/_deleteapi', function* (next) {
  if (this.query && this.query.route) {
    yield redisCo.hdel('apis', this.query.route)
    this.status = 200
  } else {
    this.type = 'json'
    this.body = {error: 'route required'}
    this.status = 401
  }
})

router.post('/_addapi', function* (next) {
  var body = yield parse.form(this.req,{limit: '30mb'} )
  if (!body.route || !body.content || !/^(GET|PUT|POST|DELETE|PATCH)/.test(body.route)) {
    this.body = { error: 'route and content empty or invalid'}
    this.status = 401
  } else {
    yield redisCo.hset('apis', body.route, body.content)
    this.res.type = 'json'
    this.body = {success: true}
  }
})

router.get('/_exportapi', function* () {
  var data = yield redisCo.hgetall('apis')
  this.body = JSON.stringify({data: data || {}}, null, '  ')
  this.response.attachment('apis.json')
})

router.post('/_importapi', function* () {
  var body = yield parse.json(this.req, {limit: '30mb'})
  if (!body.data) {
    this.body = { error: 'no data found'}
    this.status = 401
  } else {
    var data = body.data
    for (var key in data) {
      yield redisCo.hset('apis', key, data[key])
    }
    this.res.type = 'json'
    this.body = {success: true}
  }
})

app.use(cors())
app.use(router.routes())

app.use(function* (next) {
  // static resource
  if (/^\/(.*\.(js|css))?$/.test(this.path)) {
    yield next
  } else {
    var key = this.method + ' ' + this.path
    if (this.querystring) {
      key = key + '?' + this.querystring
    }
    var content = yield redisCo.hget('apis', key)
    if (content) {
      this.type = 'json'
      this.body = content
    } else {
      yield next
    }
  }
})

var root = __dirname + '/public'
app.use(liveload(root))
app.use(require('koa-static')(root, {
  index: 'index.html'
}))

app.listen(config.port, function () {
  console.log('server listening on ' + config.port)
})
