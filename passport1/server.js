const express = require('express')
const bcrypt = require('bcrypt')
const app = express()
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')

const port = 3535 || process.env.PORT

app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
  secret: 'dogdogwowhaha', // in production set this to a process.env variable
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

// pastport init
const initPassport = require('./passport-config')
initPassport(passport, getUserByEmail, getUserById)

function getUserByEmail (email) {
  return users.find(user => user.email === email)
}

function getUserById (id) {
  return users.find(user => user.id === id)
}

// data
const users = []

app.get('/', (req, res) => {
  console.log('get /')
  res.send('Welcome to the main page!')
  console.log(req.user)
})

app.get('/user', mustBeAuth, (req, res) => {
  console.log('inside /user')
  console.log(req.user)
  if (!req.user) {
    console.log('user not logged in')
    res.redirect('/')
  } else {
    res.send(req.user)
  }
})

// login
app.get('/login', mustNotBeAuth, (req, res) => {
  console.log('/get login')
  const errMessage = req.flash('error')[0]
  console.log(errMessage)
  res.json({'message':`${errMessage}`})
})

app.post('/login', mustNotBeAuth, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

// register
app.post('/register', mustNotBeAuth, async (req, res, next) => {
  console.log(req.body.password)
  console.log('post /register')

  if (getUserByEmail(req.body.email)) {
    res.json({'message': 'User already exists!'})
    return next()
  }

  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    console.log(hashedPassword)
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    })
    res.json(users)
  } catch {
    console.log('error')
    res.send('an error occurred')
  }
  
})

app.post('/logout', (req, res) => {
  if (req.user) {
    req.logOut()
  }
  res.redirect('login')
})

function mustBeAuth (req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function mustNotBeAuth (req, res, next) {
  console.log(req.isAuthenticated())
  if (req.isAuthenticated()) {
    res.redirect('/')
  } else {
    return next()
  }

}

app.listen(port, () => console.log(`Server now running on ${port}`))