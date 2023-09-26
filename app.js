//jshint esversion:6
import 'dotenv/config' 
import express from 'express'
import bodyParser from 'body-parser'
import ejs from 'ejs'
import mongoose from 'mongoose'
import { error } from 'console'
// import encrypt from 'mongoose-encryption' 
import md5 from 'md5'
import bcrypt from 'bcrypt'
const saltRounds = 10;
const port =3000
const app = express()
// console.log(md5('1234567'));
async function  connection(){
    // await mongoose.connect('mongodb://0.0.0.0:27017/secrets')
    // .then(()=>{console.log('DB is conect');})
    // .catch(error=> console.log(error))
    

    try {
        await mongoose.connect('mongodb://0.0.0.0:27017/secrets')
        console.log('Db is conected');
    } catch (error) {
        console.log(error.message);
    }

}
connection()
app.use(express.static('public'))
app.set('view engine', 'ejs')

const userSchema=new mongoose.Schema({
    email:String,
    password: String
})



// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields:['password'] });
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
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        const newUser =new User({
            email: req.body.username,
            password: hash
        })
        newUser.save().then((err)=>{
            res.render('secrets.ejs')
        }).catch((err)=>{
            console.log(err.message);
        })
    });
    
})

app.post('/login', async (req,res)=>{
    const username= req.body.username
    // const password=md5(req.body.password) 
        const password=req.body.password
    try {
      const user = await User.findOne({email:username})
        if (user) {
            bcrypt.compare(password, user.password, function(err, result) {
                if (result===true) {
                    res.render('secrets')    
                }
            });
                
            
        }
    } catch (error) {
        console.log(error.message);
    }
})

app.listen(port, function(){
    console.log('server stared on port: ', port);
})

