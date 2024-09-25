const express = require('express') 
const mongoose = require('mongoose')
const app = express();
const bodyParser = require("body-parser");
const ejs = require('ejs');
var path = require('path');
// const fileUpload = require('express-fileupload');
//const fs = require('fs');
const mongodb = require('mongodb');
const multer = require('multer');
// const binary = mongodb.Binary;
const {GridFsStorage} = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const crypto = require('crypto');
//const upload = multer({dest:'upload/'});

//setting up env
app.set('view engine','ejs');
app.set('views','views');
app.use(express.static(path.join(__dirname,'public')));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
//app.use(fileUpload());

const mongoURI = 'mongodb+srv://Santhosh:Santhosh3115@cluster0.ssgxv2w.mongodb.net/Demo';
    mongoose.connect('mongodb+srv://Santhosh:Santhosh3115@cluster0.ssgxv2w.mongodb.net/Demo',{ 
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

const conn = mongoose.createConnection(mongoURI);

app.get("/",(req,res)=>{
    res.render('home');
})


app.get("/adminLogin",(req,res)=>{
    res.render('adminLogin');
})

app.get("/jobUpdate",(req,res) => {
    Note.find().then((result)=>{
        res.render('jobUpdate',{
            Data:result
        });
    }).catch((err)=>{
        console.log("Error");
    });  
});

app.get("/result",(req,res)=>{
    res.render('result');
})

app.get('/jobRoles',(req,res)=>{
    Note.find().then((result)=>{
        res.render('jobRoles',{
            Data:result
        });
    }).catch((err)=>{
        console.log("Error");
    });
})


app.get("/register",(req,res)=>{
    Note.find().then((result)=>{
        res.render('register',{
            Data:result
        });
    }).catch((err)=>{
        console.log("Error");
    });
})

//job Update database

let gfss;

conn.once('open',()=>{
    gfss = Grid(conn.db,mongoose.mongo);
    gfss.collection('Details');
})

const jdStorage = new GridFsStorage({
    url: mongoURI,
    file:(req,file)=>{
        return new Promise((resolve,reject)=>{
            crypto.randomBytes(16,(err,buf)=>{
                if(err){
                    return reject(err);
                }
                const filename=file.originalname;
                const fileInfo={
                    filename:filename,
                    bucketName:'Details'
                };
                resolve(fileInfo);
            })
        })
    }
})

const jdUpload = multer({storage : jdStorage});

const noteSchema = {
    jobTitle:String,
    jobDes: String,
    exp:String,
    pac:String,
}

const Note = mongoose.model("Details",noteSchema);
app.post("/jobUpdate",jdUpload.single('jdfile'),(req,res)=>{
    let newNote = new Note({
        jobTitle:req.body.jobTitle,
        jobDes:req.body.jobDes,
        exp:req.body.exp,
        pac:req.body.pac,
    });
    newNote.save();
    res.redirect("/jobUpdate");
})

//register database

let gfs;

conn.once('open',()=>{
    gfs = Grid(conn.db,mongoose.mongo);
    gfs.collection('demo');
})

const storage = new GridFsStorage({
    url: mongoURI,
    file:(req,file)=>{
        return new Promise((resolve,reject)=>{
            crypto.randomBytes(16,(err,buf)=>{
                if(err){
                    return reject(err);
                }
                const filename=file.originalname;
                const fileInfo={
                    filename:filename,
                    bucketName:'demo'
                };
                resolve(fileInfo);
            })
        })
    }
})

const upload = multer({storage});

const detailSchema = {
    fname:String,
    lname:String,
    email:String,
    phone:String,
    jobSelect:String,
}

const reg = mongoose.model("demo",detailSchema);

app.post('/register',upload.single('file'),(req,res)=>{
    let newReg = new reg({
        fname:req.body.fname,
        lname:req.body.lname,
        email:req.body.email,
        phone:req.body.phone,
        jobSelect:req.body.jobSelect,
    });
    newReg.save();
    res.redirect("/register");
})


app.listen(3000,()=>{
    console.log("Server running");
})