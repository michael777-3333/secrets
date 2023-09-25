//jshint esversion:6
import 'dotenv/config' 
import express from 'express'
import bodyParser from 'body-parser'
import ejs from 'ejs'
import mongoose from 'mongoose'
import { error } from 'console'
import encrypt from 'mongoose-encryption'


const port =3000
const app = express()
console.log(process.env.API_KEY);
async function connection(){
    await mongoose.connect('mongodb://0.0.0.0:27017/secrets')
    .then(()=>{console.log('DB is conect');})
    .catch(error=> console.log(error))
}
connection()
app.use(express.static('public'))
app.set('view engine', 'ejs')

const userSchema=new mongoose.Schema({
    email:String,
    password: String
})



userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields:['password'] });
const User=new mongoose.model('User',userSchema)

app.use(bodyParser.urlencoded({
    extended:true
}))

app.get('/',(req, res)=>{
    res.render('home.ejs')
})
app.get('/login',(req, res)=>{
    res.render('login.ejs')
})
app.get('/register',(req, res)=>{
    res.render('register.ejs')
})

app.post('/register', (req,res)=>{
    const newUser =new User({
        email: req.body.username,
        password:req.body.password
    })
    newUser.save().then((err)=>{
        res.render('secrets.ejs')
    }).catch((err)=>{
        console.log(err.message);
    })
})

app.post('/login', (req,res)=>{
    const username= req.body.username
    const password= req.body.password

    try {
      const user =  User.findOne({email:username})
        if (user) {
            if (user.password=== password) {
                res.render('secrets')
            }
        }
    } catch (error) {
        console.log(error.message);
    }
})

app.listen(port, function(){
    console.log('server stared on port: ', port);
})

