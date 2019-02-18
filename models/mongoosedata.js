// /backend/data.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// this will be our data base's data structure 
const DataSchema = new Schema(
  {
    email: String,
    password: String,
    database: String,
    encryption: String,
    id:{
    	type: String,
    	unique: true,
  }}
);

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("User", DataSchema);