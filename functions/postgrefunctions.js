var express = require('express');  
var router = express.Router();
const app = express();
var aes256 = require('nodejs-aes256');
var crypto = require('crypto'); 

var key="-----BEGIN PUBLIC KEY-----MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAs9cC/KC7sVVS4mT46WZT MYOG4p9sxGJaFpMYZSWoDy0O89aT+Q+DNYGAPJJBXZaFluqiQa5VNm46t84QuUWL JcscvGIWDpTs+0MnpYxlA6UNojKLJsssHGO4ymjTFpNzA1Hzfxx2DqxRu6lxUktQ PvLfPeuYTfAefwTPlOdptivKUJPvBS3U7kdcTRJA5SSFHHlUUWOzXJH/hBfDffEh acFV5QbQlwSK1NCS87dRvOvza/B2+5OYg+JEsug7OTLoqcu6eZEB4U8sJqbTazNs 4HovvIgotYyer9L7DBcyQh2Cso9IIAoYK1Bu1Zt5l1Gp1hLsd68Eo1SlZwYs6Zgj ztkYTXQIQ5f+fJRqzn2QM8qQ6YROkgBlsWlu+WtWVEnOzUofCfn/Gl4fjfPZulZo J5jdg2yVw11J9PHtaNTynuWSxXtw1ZAUhqhBU84REfZ+vQ+Sck5YTUqKSdkLDnvs xmI66cVADKUPv+jgrEN1qxhqDSetw3L1bZot1Hs045TOj/GBNEW3mWr6/zSceVmT +T5Lya1olG4MbeXwunBrF0sm9/Hr2Et6LqLsrjQBPNw2zDVU3DA/yzU3qPmnl2WW 1tyAR+RqpteZHg+pZkQ07bstYRZSvxytAuUY0UcsXVk2AlPXylfS+KAPO9TX1k1v 57XW2LbnLJ3o00NaOulCe4kCAwEAAQ== -----END PUBLIC KEY-----"

exports.postgrefunc= {};

const Pool = require('pg').Pool
const pool = new Pool({
  user: 'tanuj',
  host: 'localhost',
  database: 'api',
  password: 'munnug',
  port: 5432,
})


function adddata(datagiven,callback)
{
	obj={}
	console.log("data from front end to postgres",datagiven)
	const { id, email, password, encryption, database} = datagiven;

	pool.query('SELECT * FROM users WHERE email=$1 or password=$2', [ email, password],(err, data) => {
	    if (err || data.rowCount===0) 
	    {
	      pool.query('INSERT INTO users (password, email, encryption, database, id) VALUES ($1, $2, $4, $3, $5)', [password, email, database, encryption, id], (err, results) => {
			console.log("error occured while adding data to database:- ", err)
		    if (err) {
		      console.log("error occured while updating database:- ", err)
		      obj.success=false
		      obj.error=err 
		      return callback(null,obj)
		    }
		    obj.success=true
			return callback(null, obj)
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
exports.postgrefunc.adddata = adddata;

function getdata(datagiven,callback)
{
	obj={}

	console.log("data from front end to postgres",datagiven)
	const { email, password, database, encryption } = datagiven;
	console.log(datagiven)
	pool.query('SELECT * FROM users WHERE email=$1 AND database=$2 AND encryption=$3', [ email, database,encryption],(err, results) => {
	    if (err) {
	      console.log("error occured while updating database:- ", err)
	      obj.success=false
	      obj.error=err 
	      return callback(null,obj)
	    }
	    else if(results.rowCount===0)
	    {
	    	console.log("no row found matching data")
	    	obj.success=false
	    	return callback(null,obj)
	    }
		else if(encryption==="encryption")
		{
			
			if(aes256.decrypt(results.rows[0].id, results.rows[0].password)===password)
			{
				
				obj.success=true
				return callback(null,{row: results.rows[0],...obj})
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
			
			if(crypto.pbkdf2Sync(password, results.rows[0].id, 1000, 64, `sha512`).toString(`hex`)===results.rows[0].password)
			{
				obj.success=true
				return callback(null,{row: results.rows[0],...obj})
			}
			else
			{
				console.log("password does not match")
				obj.success=false
	    		return callback(null,obj)
			}
		}
	    
		
  	})
}
exports.postgrefunc.getdata = getdata;


function updatedata(datagiven,callback)
{
	obj={} 
    console.log("data from front end to mongoose",datagiven)
    const { email, database, password, opassword , id} = datagiven;
    pool.query('SELECT * FROM users WHERE email=$1 AND database=$2', [ email, database],(err, data) => {
    if (err) 
    {
      console.log("error occured while updating database:- ", err)
      obj.success=false
      obj.error=err 
      return callback(null,obj)
    }
    else
    {
    	console.log(data.rows[0].id, data.rows[0].password, aes256.decrypt(data.rows[0].id, data.rows[0].password))
      if((datagiven.encryption==="encryption" && aes256.decrypt(data.rows[0].id, data.rows[0].password)===datagiven.opassword)||(datagiven.encryption==="hashing" && crypto.pbkdf2Sync(opassword, results.rows[0].id, 1000, 64, `sha512`).toString(`hex`)===results.rows[0].password))
      {
        pool.query('UPDATE users SET password = $1, id= $4 WHERE email=$3 AND database=$2',[password, database, email, id], err => {
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
        return callback(null,obj)
      }
      
    }

  })
    
}
exports.postgrefunc.updatedata = updatedata;

function deletedata(datagiven,callback)
{
	obj={}
	const { email, password } = datagiven;
	pool.query('DELETE FROM users WHERE email = $1', [email], (err, results) => {
	    if (err) {
	      console.log("error occured while Deleting row:- ", err)
	      obj.success=false
	      obj.error=err 
	      return callback(null,obj)
	    }
	    obj.success=true
		return callback(null, obj)
  	})
}
exports.postgrefunc.deletedata = deletedata;


