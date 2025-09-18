if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing = require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("./schema.js");
const Review =require("./models/review.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const LocalStratergy=require("passport-local");
const User=require("./models/user.js");

const listingRouter=require("./routes/listing.js");
const reviewRoute=require("./routes/review.js");
const userRouter=require("./routes/user.js");


// const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";
const MONGO_URL=process.env.ATLASDB_URL;
main().then(()=>{
    console.log("connected to DB");
})
.catch((err)=>{ 
    console.log(err);
});
async function main() {
  await mongoose.connect(MONGO_URL);

}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"/public")));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);

const SECRET = process.env.SECRET || "thisshouldbeabettersecret";

const store=MongoStore.create({
    mongoUrl: MONGO_URL,
    crypto: {
        secret: SECRET,
      },
      touchAfter:24*3600,
  });
 store.on("error",(err)=>{
    console.log("Error in Mongo Session store", err);
 });
const sessionOptions={
    store,
    secret: SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*1000,
        maxAge:7*24*60*1000,
        httpOnly:true
    },
    
};



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStratergy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;

   // console.log(res.locals.success);
    next();
});



// app.get("/demo",async(req,res)=>{
//     let fakeUser=new User({
//         email:"abc@gmail.com",
//         username:"delta",
    
//     });
//    let registerUser=await User.register(fakeUser,"helloword");  ///static method of User
//     res.send(registerUser);
// });


app.use("/listing",listingRouter);
app.use("/listing/:id/review", reviewRoute);
app.use("/",userRouter);


app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not Found."));

});

app.use((err,req,res,next)=>{
    let{statusCode=500,message="Something went wrong!"}=err;
    res.render("listings/error.ejs",{err});
    //res.status(statusCode).send(message);
});

app.listen(8080,()=>{
    console.log("Server is listening on 8080 port");
});