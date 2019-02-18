var key="-----BEGIN PUBLIC KEY-----MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAs9cC/KC7sVVS4mT46WZT MYOG4p9sxGJaFpMYZSWoDy0O89aT+Q+DNYGAPJJBXZaFluqiQa5VNm46t84QuUWL JcscvGIWDpTs+0MnpYxlA6UNojKLJsssHGO4ymjTFpNzA1Hzfxx2DqxRu6lxUktQ PvLfPeuYTfAefwTPlOdptivKUJPvBS3U7kdcTRJA5SSFHHlUUWOzXJH/hBfDffEh acFV5QbQlwSK1NCS87dRvOvza/B2+5OYg+JEsug7OTLoqcu6eZEB4U8sJqbTazNs 4HovvIgotYyer9L7DBcyQh2Cso9IIAoYK1Bu1Zt5l1Gp1hLsd68Eo1SlZwYs6Zgj ztkYTXQIQ5f+fJRqzn2QM8qQ6YROkgBlsWlu+WtWVEnOzUofCfn/Gl4fjfPZulZo J5jdg2yVw11J9PHtaNTynuWSxXtw1ZAUhqhBU84REfZ+vQ+Sck5YTUqKSdkLDnvs xmI66cVADKUPv+jgrEN1qxhqDSetw3L1bZot1Hs045TOj/GBNEW3mWr6/zSceVmT +T5Lya1olG4MbeXwunBrF0sm9/Hr2Et6LqLsrjQBPNw2zDVU3DA/yzU3qPmnl2WW 1tyAR+RqpteZHg+pZkQ07bstYRZSvxytAuUY0UcsXVk2AlPXylfS+KAPO9TX1k1v 57XW2LbnLJ3o00NaOulCe4kCAwEAAQ== -----END PUBLIC KEY-----"


var express = require('express');  
var router = express.Router();
const mongoose = require("mongoose");
const Data = require("../models/mongoosedata");
const bodyParser = require("body-parser");
const logger = require("morgan");
const app = express();
var crypto = require('crypto'); 
var aes256 = require('nodejs-aes256');

const dbRoute = 'mongodb://localhost/my_database';


mongoose.connect(
  dbRoute,
  { useNewUrlParser: true }
);

let db = mongoose.connection;

db.once("open", () => console.log("connected to the database"));


db.on("error", console.error.bind(console, "MongoDB connection error:"));


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger("dev"));

exports.mongoosefunc= {};

function adddata(datagiven, callback)
{
  let data1 = new Data();

  const { id, email, password, encryption, database} = datagiven;
  
  data1.email = email;
  data1.password = password;
  data1.encryption = encryption;
  data1.database = database;
  data1.id= id;
  //Data.deleteMany();
  console.log("data from front end to mongoose",datagiven)
  var obj= {}
  Data.find({$or:[{"email":datagiven.email}, {"password":datagiven.password}]},(err, data) => {
    if (err || data.length===0) 
    {
      data1.save(err => {
        if (err) 
        {
          console.log("error occured while adding data to database:- ", err)
          obj.success=false
          obj.error=err 
          return callback(null,obj)
        }
        else
        {
          console.log("data successfully added")
          obj.success=true
          return callback(null, obj)
        }
      });
    }
    else 
    {
      console.log("email or password already exists")
      obj.success=false
      obj.error="email or password already exists"
      return callback(null, obj)
    }
  });
    
}

exports.mongoosefunc.adddata = adddata;

function getdata(datagiven,callback)
{
  var obj= {}
  console.log("data from front end to mongoose",datagiven)
  
  
  Data.find({"email":datagiven.email,"database":datagiven.database,"encryption":datagiven.encryption},(err, data) => {
    if (err) 
    {
      console.log("error occured while getting data from database:- ", err)
      obj.success=false
      obj.error=err 
      return callback(null,obj)
    }
    else if(data.length===0)
    {
      console.log("no data available matching inquiry")
      obj.success=false
      return callback(null, obj)
    }
    else if(datagiven.encryption==="encryption")
    {
      
      if(aes256.decrypt(data[0].id, data[0].password)===datagiven.password)
      {
        
        obj.success=true
        return callback(null,{row: data[0],...obj})
      }
      else
      {
        console.log("password does not match")
        obj.success=false
          return callback(null,obj)
      }
      
    }
    else if(datagiven.encryption==="hashing")
    {
      
      if(crypto.pbkdf2Sync(datagiven.password, data[0].id, 1000, 64, `sha512`).toString(`hex`)===data[0].password)
      {
        obj.success=true
        return callback(null,{row: data[0],...obj})
      }
      else
      {
        console.log("password does not match")
        obj.success=false
          return callback(null,obj)
      }
    }

  });
}

exports.mongoosefunc.getdata = getdata;

function updatedata(datagiven,callback)
{
  console.log("data from front end to mongoose",datagiven)
  Data.find({ database: datagiven.database,  email : datagiven.email},(err, data) => {
    if (err) 
    {
      console.log("error occured while updating database:- ", err)
      obj.success=false
      obj.error=err 
      return callback(null,obj)
    }
    else
    {
      if((datagiven.encryption==="encryption" && aes256.decrypt(data[0].id, data[0].password)===datagiven.opassword)||(datagiven.encryption==="hashing" && crypto.pbkdf2Sync(datagiven.opassword, data[0].id, 1000, 64, `sha512`).toString(`hex`)===data[0].password))
      {
        Data.update({password : datagiven.password , id: datagiven.id }, { database: datagiven.database,  email : datagiven.email}, err => {
          if (err) 
          {
            console.log("error occured while updating database:- ", err)
            obj.success=false
            obj.error=err 
            return callback(null,obj)
          }
          else
          {
            console.log("data successfully updated")
            obj.success=true
            return callback(null,obj)
          }

        });
      }
      else
      {
        console.log("password is wrong")
        obj.success=false
        obj.error=err 
        return callback(null,obj)
      }
      
    }

  })
    
}

exports.mongoosefunc.updatedata = updatedata;

function deletedata(datagiven)
{
  console.log("data from front end to mongoose",datagiven)
  Data.Delete( {_id : datagiven}, err => {
    if (err) 
    {
      console.log("error occured while Deleting row:- ", err)
      obj.success=false
      obj.error=err 
      return callback(null,obj)
    }
    else
    {
      console.log("data successfully Deleted")
      obj.success=true
      return callback(null, obj)
    }
  });
}
exports.mongoosefunc.deletedata = deletedata;


