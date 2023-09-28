//jshint esversion:6
import 'dotenv/config' 
import express from 'express'
import bodyParser from 'body-parser'
import ejs from 'ejs'
import mongoose from 'mongoose'
import { error, log } from 'console'
// import encrypt from 'mongoose-encryption' 
import md5 from 'md5'
// import bcrypt from 'bcrypt'
// const saltRounds = 10;

import session from 'express-session'
import passport from 'passport'
import passportLocalMongoose from 'passport-local-mongoose'
const port =3000
const app = express()
// console.log(md5('1234567'));
app.use(express.static('public'))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({
    extended:true
}))
app.use(session({
    secret:'our little secret',
    resave:false,
    saveUninitialized:false
}))

app.use(passport.initialize())
app.use(passport.session())
async function  connection(){
    try {
        await mongoose.connect('mongodb://0.0.0.0:27017/secrets')
        console.log('Db is conected');  
    } catch (error) {
        console.log(error.message);
    }
}
connection()
// mongoose.set('useCreateIndex',true)
const userSchema=new mongoose.Schema({
    email:String,
    password: String
})
userSchema.plugin(passportLocalMongoose)
const User=new mongoose.model('User',userSchema)


passport.use(User.createStrategy())
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields:['password'] });


app.get('/',(req, res)=>{
    res.render('home.ejs')
})
app.get('/login',(req, res)=>{
    res.render('login.ejs')
})
app.get('/register',(req, res)=>{
    res.render('register.ejs')
})
app.get('/secrets', (req,res)=>{
    if (req.isAuthenticated) {
        res.render('secrets.ejs')
    }else {
        res.redirect('/login')
    }
})

app.post('/register', (req,res)=>{
    // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    //     const newUser =new User({
    //         email: req.body.username,
    //         password: hash
    //     })
    //     newUser.save().then((err)=>{
    //         res.render('secrets.ejs')
    //     }).catch((err)=>{
    //         console.log(err.message);
    //     })
    // });
    User.register({username:req.body.username}, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect('/register')
        }else{
            passport.authenticate('local')(req,res, function(){
                res.redirect('/secrets')
            })
        }
    })

})

app.post('/login', (req,res)=>{
    // const username= req.body.username
    // // const password=md5(req.body.password) 
    //     const password=req.body.password
    // try {
    //   const user = await User.findOne({email:username})
    //     if (user) {
    //         bcrypt.compare(password, user.password, function(err, result) {
    //             if (result===true) {
    //                 res.render('secrets')    
    //             }
    //         });
                
            
    //     }
    // } catch (error) {
    //     console.log(error.message);
    // }

    const user =new User({
        username:req.body.username,
        password:req.body.password
    })

    req.login(user,function (err) {
        if (err) {
            console.log(err);
        }else{
            passport.authenticate('local')(req,res, function(){
                res.redirect('/secrets')
            })
        }
    })
})

app.get('/logout',async function(req,res,next){
    try {
        req.logout(function(err){
            if (err) {
                console.log(err);
            }
            console.log('logout callback called');
            res.redirect('/')
            
            
        })
    } catch (error) {
        console.log(error);
    }
})

app.listen(port, function(){
    console.log('server stared on port: ', port);
})

