var express = require('express');  
var router = express.Router();
const bodyParser = require("body-parser");
const logger = require("morgan");

var mongoosefunctions = require('../functions/mongoosefunctions');
var postgreyfunctions = require('../functions/postgreyfunctions');
var elasticsearcfunctions = require('../functions/elasticsearchfunctions');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger("dev"));

router.post("/",(req,res)=>{
	const data= req.body;
	if(data.database=="elasticsearch")
	{
		const returnObj = elasticsearcfunctions.elasticsearcfunc.adddata(data)
		res.json(returnObj);
	}
	else if(data.database=="mondodb")
	{
		const returnObj = mongoosefunctions.mongoosefunc.adddata(data)
		res.json(returnObj)
	}
	else
	{
		const returnObj = postgreyfunctions.postgreyfunc.adddata("",[data.email,data.password,data.encryption])
		res.json(returnObj)
	}
});

module.exports = router;