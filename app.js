const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const lodash = require("lodash");

const date = require(__dirname+"/date.js");
const app = express();

// Using ejs with express
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://ruchi:Kumari123@cluster0.kdsaye1.mongodb.net/todolistDB');

const itemsSchema = new mongoose.Schema({
  name:String
});

const Item = mongoose.model("Item",itemsSchema);

const item1 = new  Item({
  name : "Welcome to your todolist!"
});
const item2 = new Item({
  name:"Hit the ➕ buttton to add a new item or to create a new list."
});
const item3 = new  Item({
  name:"🡄 Hit this to delete an item."
});

const defaultItems = [item1,item2,item3];

const listsSchema = {
  name:String,
  items:[itemsSchema]
}

const List = mongoose.model("List",listsSchema);


app.get("/",function(req,res){
  Item.find(function(err,items){
    if(err){
      console.log(err);
    }
    else if(items.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Inserted successfully!");
        }
      });
      res.redirect("/");
    }
    else{
        const day = date.getDate();
        res.render("list",{listTitle: day , newListItems:items});
    }
  });

  // const day = date.getDate();
  // res.render("list",{listTitle: day , newListItems : defaultItems});
});

// Express Route parameters
// Creating custom lists using express
app.get("/:customListName",function(req,res){

  const customListName = lodash.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err,result){
    if(err){
      console.log(err);
    }
    else{
      if(!result){
        // Create the new list

        const list = new List({
          name:customListName,
          items:defaultItems
        });

        list.save();
        res.redirect("/"+customListName);
      }
      else{
        res.render("list",{listTitle:result.name , newListItems:result.items});
      }
    }
  })
});



app.post("/",function(req,res){
  const itemName = req.body.newItem;
  const listName = req.body.list
  const item = new Item({
    name : itemName
  });
  if(listName===date.getDate()){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      if(err){
        console.log(err);
      }
      else{
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listName);
      }
    });
  }
})
// app.post("/",function(req,res){
//   const item = req.body.newItem;
//   if(req.body.list==="Work List"){
//     workItems.push(item);
//     res.redirect("/work");
//   }
//   else{
//     items.push(item);
//     res.redirect("/");
//   }
//
// })

// Delete items from list when client deletes it by clicking on checkbox.
app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.list;
  if(listName===date.getDate()){
    Item.deleteOne({_id:checkedItemId},function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Deleted successfully!");
        res.redirect("/");
      }
    });
  }
  else{
    // Mongoose method to delete an item from an array and update the database.
    List.findOneAndUpdate({name:listName},{$pull: {items : {_id:checkedItemId}}},function(err){
      if(!err){
        console.log("Deleted items successfully from custom lists!");
        res.redirect("/"+listName);
      }
    });

  }
})

app.post("/URL",function(req,res){
  const parameter = req.body.list=req.body.add;
  res.redirect("/"+parameter);
});

// To be hosted on Heroku server
// let port = process.env.PORT;
// if (port == null || port == "") {
//   port = 3000;
// }

app.listen(process.env.PORT || 3000,function(){
  console.log("Server has started successfully.");
});
