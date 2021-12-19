//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require('lodash');
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect(
  "mongodb+srv://admin-ritesh:Test-123@cluster0.izxzh.mongodb.net/todolistDB",{useNewUrlParser:true}
);

const itemsSchema={
  name:String
};
const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"Welconme to your Todo List"
});

const item2=new Item({
  name:"Click+ Sign to add items"
});
const item3=new Item({
  name:"Hit this to delete an Item"
});
const defaultItems=[item1,item2,item3];
const listSchema={
  name:String,
  items:[itemsSchema]

};
const List=mongoose.model("List",listSchema);


app.get("/", function(req, res) {

  Item.find({},function(err,foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItems,function(err)
      {
        if(err)
        console.log(err);
        else{
          console.log("Successfully saved the items");
        }
      });
      res.redirect("/");
    }
    else
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  });
  

});
app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,results)
  {
    if(!err){
    if(!results) 
    {
      const list=new List({
        name:customListName,
        items:defaultItems
      });
      list.save();
      res.redirect("/"+ customListName);
    }
    else
    {
      res.render("list",{listTitle:results.name,newListItems:results.items});
    }

  }
  });


  
});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
const item=new Item({
  name:itemName
});
if(listName=="Today")
{
  item.save();
  res.redirect("/");
}
else{
  List.findOne({name:listName},(err,foundList)=>{
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
  })
}


 
});
app.post("/delete",function(req,res){
const checkedItemId=req.body.checkbox;
const checkedListTitle=req.body.listName;
if(checkedListTitle=="Today"){
Item.findByIdAndRemove(checkedItemId,function(err){
  if(err)
  console.log(err);
  else
  res.redirect("/");
});
}
else
{
  List.findOneAndUpdate({name:checkedListTitle},{$pull: {items: {_id:checkedItemId}}},function(err,foundList){
    if(!err)
      res.redirect("/"+checkedListTitle);
  });
    


  }
  



});



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT||3000, function() {
  console.log("Server started on port 3000");
});
