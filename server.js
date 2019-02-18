const API_PORT = 3001;
var key="-----BEGIN PUBLIC KEY-----MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAs9cC/KC7sVVS4mT46WZT MYOG4p9sxGJaFpMYZSWoDy0O89aT+Q+DNYGAPJJBXZaFluqiQa5VNm46t84QuUWL JcscvGIWDpTs+0MnpYxlA6UNojKLJsssHGO4ymjTFpNzA1Hzfxx2DqxRu6lxUktQ PvLfPeuYTfAefwTPlOdptivKUJPvBS3U7kdcTRJA5SSFHHlUUWOzXJH/hBfDffEh acFV5QbQlwSK1NCS87dRvOvza/B2+5OYg+JEsug7OTLoqcu6eZEB4U8sJqbTazNs 4HovvIgotYyer9L7DBcyQh2Cso9IIAoYK1Bu1Zt5l1Gp1hLsd68Eo1SlZwYs6Zgj ztkYTXQIQ5f+fJRqzn2QM8qQ6YROkgBlsWlu+WtWVEnOzUofCfn/Gl4fjfPZulZo J5jdg2yVw11J9PHtaNTynuWSxXtw1ZAUhqhBU84REfZ+vQ+Sck5YTUqKSdkLDnvs xmI66cVADKUPv+jgrEN1qxhqDSetw3L1bZot1Hs045TOj/GBNEW3mWr6/zSceVmT +T5Lya1olG4MbeXwunBrF0sm9/Hr2Et6LqLsrjQBPNw2zDVU3DA/yzU3qPmnl2WW 1tyAR+RqpteZHg+pZkQ07bstYRZSvxytAuUY0UcsXVk2AlPXylfS+KAPO9TX1k1v 57XW2LbnLJ3o00NaOulCe4kCAwEAAQ== -----END PUBLIC KEY-----"
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
var aes256 = require('nodejs-aes256');
var crypto = require('crypto'); 

const app = express();

const cors = require("cors")
app.use(cors());

app.use(function(req,res,next){
  res.header('Access-Control-Allow-Origin',"*")
  res.header('Access-Control-Allow-Methods',"GET,POST,PUT,DELETE,UPDATE")
  res.header('Access-Control-Allow-Headers',"Origin,X-Requested-With,Content-Type, Accept")
  next();
})


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var mongoosefunctions = require('./functions/mongoosefunctions');
var postgrefunctions = require('./functions/postgrefunctions');
var elasticsearcfunctions = require('./functions/elasticsearchfunctions');
var encryptionfunc = require('./functions/encryption');
var hashingfunc = require('./functions/hashing');
var passwordHash = require('password-hash');



//add method 
app.post("/add", (req,res) => {
  var data= req.body;
  data.id="";
  console.log("we have entered add route and data sent to us fron front end is :-",data)
  if(req.body.encryption==="encryption")
  {
    console.log("password we will add is:-", data.password)
    data.id = crypto.randomBytes(16).toString('hex');
    data.password = aes256.encrypt(data.id, data.password);
    console.log("encrypted password we will add is:-", data.password)
  }
  else if(req.body.encryption==="hashing")
  {
    console.log("password we will add is:-", data.password)
    data.id = crypto.randomBytes(16).toString('hex'); 
    data.password = crypto.pbkdf2Sync(data.password, data.id,  
    1000, 64, `sha512`).toString(`hex`);
    console.log("hashed password we will add is:-", data.password)
  }
  else
  {
    res.json({obj:{success: false,err:"encryption input is wrong"}});
  }

  if(data.database==="elasticsearch")
  {
    console.log("calling elastic search adddata")
    elasticsearcfunctions.elasticsearcfunc.adddata(data, (error, data) => {
      console.log("data to be sent to frontend as res:- ", data)
      res.json(data);
    })
  }
  else if(data.database==="mongoose")
  {
    console.log("calling mongoose adddata")
    mongoosefunctions.mongoosefunc.adddata(data, (error, data) => {
      console.log("data to be sent to frontend as res:- ", data)
      res.json(data)
    } ) 
  }
  else if(data.database==="postgre")
  {
    console.log("calling postgres adddata")
    postgrefunctions.postgrefunc.adddata(data, (error, data) => {
      console.log("data to be sent to frontend as res:- ", data)
      res.json(data)
    })
  }
  else
  {
    res.json({obj:{success:false ,err:"database input is wrong"}});
  }
});

app.post("/verify", (req,res) => {
  var data= req.body;

  console.log("we have entered verify route and data sent to us fron front end is :-",data)
  if(data.database==="elasticsearch")
  {
    console.log("calling elastic search adddata")
    elasticsearcfunctions.elasticsearcfunc.getdata(data, (error, data) => {

      console.log("data to be sent to frontend as res:- ", data)
      res.json(data);
    })
  }
  else if(data.database==="mongoose")
  {
    console.log("calling mongoose getdata")
    mongoosefunctions.mongoosefunc.getdata(data, (error, data) => {
      console.log("data to be sent to frontend as res:- ", data)
      res.json(data)
    } ) 
  }
  else if(data.database==="postgre")
  {
    console.log("calling postgres getdata")
    postgrefunctions.postgrefunc.getdata(data, (error, data) => {
      console.log("data to be sent to frontend as res:- ", data)
      res.json(data)
    })
  }
  else
  {
    res.json({obj:{success:false ,err:"database input is wrong"}});
  }
});

app.post("/update", (req,res) => {
  var data= req.body;
  data.id=""
  console.log("we have entered update route and data sent to us fron front end is :-",data)
  if(req.body.encryption==="encryption")
  {
     
    data.id = crypto.randomBytes(16).toString('hex');
    data.password = aes256.encrypt(data.id, data.password);
    
  }
  else if(req.body.encryption==="hashing")
  {
    console.log("password we will add is:-", data.password)
    data.id = crypto.randomBytes(16).toString('hex'); 
    data.password = crypto.pbkdf2Sync(data.password, data.id,  
    1000, 64, `sha512`).toString(`hex`);
    console.log("hashed password we will add is:-", data.password)
  }
  else
  {
    res.json({obj:{success:false ,err:"encryption input is wrong"}});
  }

  if(data.database==="elasticsearch")
  {
    console.log("calling elastic search updatedata")
    elasticsearcfunctions.elasticsearcfunc.updatedata(data, (error, data) => {
      console.log("data to be sent to frontend as res:- ", data)
      res.json(data);
    })
  }
  else if(data.database==="mongoose")
  {
    console.log("calling mongoose updatedata")
    mongoosefunctions.mongoosefunc.updatedata(data, (error, data) => {
      console.log("data to be sent to frontend as res:- ", data)
      res.json(data)
    } ) 
  }
  else if(data.database==="postgre")
  {
    console.log("calling postgres updatedata")
    postgrefunctions.postgrefunc.updatedata(data, (error, data) => {
      console.log("data to be sent to frontend as res:- ", data)
      res.json(data)
    })
  }
  else
  {
    res.json({obj:{success: false,err:"database input is wrong"}});
  }
});

app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));
