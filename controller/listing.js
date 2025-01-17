const Listing = require("../models/listing.js");

module.exports.index=async(req,res)=>{
    const allListings=await  Listing.find({});
    res.render("./listings/index.ejs",{allListings});
 
 };

 module.exports.renderNewForm=(req,res)=>{
    console.log(req.user);

     res.render("./listings/new.ejs");
 };

 module.exports.showListing=async(req,res)=>{
    let id=req.params.id;
    const listing= await Listing.findById(id)
    .populate({
        path:"review",
    populate:{
        path:"author",
    },
    })
    .populate("owner");
    if(!listing){
        req.flash("error","Listing you requested does not exists");
        res.redirect("/listing");
    }
    res.render("./listings/show.ejs",{listing});
 
};

module.exports.createListing=async (req,res,next)=>{
    let url=req.file.path;
    let filename=req.file.filename;
    console.log(req.body);
    const newlisting= new Listing(req.body.listing);
    newlisting.owner=req.user._id;
    newlisting.image={url,filename};
    await newlisting.save();
    req.flash("success","New listing created successfully");
    res.redirect("/listing");

};

module.exports.renderEditForm=async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    console.log(listing);
    if(!listing){
        req.flash("error","Listing you requested does not exists");
        res.redirect("/listing");
    }
    let orignalImgUrl=listing.image.url;
    orignalImgUrl=orignalImgUrl.replace("/upload","/upload/w_250");
    res.render("./listings/edit.ejs",{listing,orignalImgUrl});

};
module.exports.update=async(req,res)=>{
    let {id}=req.params;
    let listing=  await Listing.findByIdAndUpdate(id,{...req.body.listing});
    if(typeof req.file !="undefined"){
        let url=req.file.path;
        let filename=req.file.filename;
        listing.image={url,filename};
        await listing.save();
    }

    req.flash("success","Listing Updated suucessfully");
    res.redirect("/listing");

};

module.exports.destroyListing=async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted successfully");
    res.redirect("/listing");
};