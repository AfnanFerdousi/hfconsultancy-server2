const Subject =require("../models/subject");
const fs =require("fs");
const slugify =require("slugify");
const braintree =require("braintree");
const dotenv =require("dotenv");
const Order =require("../models/order.js");
const sgMail =require("@sendgrid/mail");
const multer = require('multer');
const mongoose =require("mongoose");
const { ObjectId } = mongoose.Schema;
require("dotenv").config();

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_KEY);

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

// creating subject
exports.create = async (req, res) => {
  try {
    const storage=multer.diskStorage({
      destination: (req,file,callBack)=> {
          callBack(null,'public/media');
      },
      filename: (req,file,callBack)=> {
          callBack(null,file.originalname)
      }    
      
  });
  const maxSize = 5 * 1024 * 1024; // for 5MB  
  const upload=multer({
    storage:storage,
    fileFilter: (req, file, cb)=> {
      if(file.mimetype==="image/jpg"||
        file.mimetype==="image/png"||
        file.mimetype==="image/jpeg"||
        file.mimetype==="image/webp"      
      ){
        cb(null, true)
      }else{
        cb(null, false);
        return cb(new Error("Only jpg, png, jpeg and webp format is allowed"))
      }
    },
    limits: { fileSize: maxSize }
  }).fields([{ name: 'logo', maxCount: 1 }, { name: 'photo', maxCount: 8 }])
  upload(req,res, (error)=> {  
    console.log("req.body", req.body);
    console.log("req.files", req.files);
    const {title}=req.body
  
    let fields=req.body
    let subject = new  Subject({ ...req.body, slug: slugify(title)}); 
    
    subject.photo.data = fs.readFileSync(req.files['photo'][0].path);
    subject.photo.contentType = req.files['photo'][0].mimetype;
    subject.logo.data = fs.readFileSync(req.files['logo'][0].path);
    subject.logo.contentType = req.files['logo'][0].mimetype;
    
    subject.save((err, result) => {
      if (err) {
        console.log("saving subject err => ", err);
        res.status(400).json({
          status:"Fail",
          message:err.message
        });
      }
      res.json(result);
    });


    if (error instanceof multer.MulterError) {        
      res.status(400).json({
        status:"Fail",
        message:error.message
      })
    } else if (error) {      
      res.status(400).json({
        status:"Fail",
        message:error.message
      })
    } 
});   
  } catch (err) {
    console.log(err);
    res.status(400).json({
      err: err.message,
    });
  }
};

// getting all subjects information
exports.list = async (req, res) => {
  try {
    const subjects = await Subject.find({})     
      .select("-photo")
      .select("-logo")
      .limit(12)
      .sort({ createdAt: -1 });

    res.json(subjects);
  } catch (err) {
    console.log(err);
  }
};

// read details of a specific subject

exports.read = async (req, res) => {
  try {
    const subject = await Subject.findOne({ slug: req.params.slug })
    .select("-photo")
    .select("-logo")   

    res.json(subject);
  } catch (err) {
    console.log(err);
  }
};

// get photo of a specific subject

exports.photo = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.subjectId)
    .select("photo")
    .select("-logo");
    console.log("contentType testing=====>",subject.photo.contentType)
    if (subject.photo.data) {
      res.header('Cross-Origin-Resource-Policy', 'cross-origin');
      res.set("Content-Type", subject.photo.contentType);
      return res.send(subject.photo.data);
    }
  } catch (err) {
    console.log(err);
  }
};

// get logo of a specific subject
exports.logo = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.subjectId)
    .select("-photo")
    .select("logo");
    console.log("contentType testing=====>",subject.logo.contentType)
    if (subject.logo.data) {
      res.header('Cross-Origin-Resource-Policy', 'cross-origin');
      res.set("Content-Type", subject.logo.contentType);
      return res.send(subject.logo.data);
    }
  } catch (err) {
    console.log(err);
  }
};

// remove specific subject
exports.remove = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(
      req.params.subjectId
    ).select("-photo").select("-logo");
    res.json(subject);
  } catch (err) {
    console.log(err);
  }
};

//  update a specific subject
exports.update=async (req, res) => {
  try {
    const storage=multer.diskStorage({
      destination: (req,file,callBack)=> {
          callBack(null,'public/media');
      },
      filename: (req,file,callBack)=> {
          callBack(null,file.originalname)
      }    
      
  });
  const maxSize = 5 * 1024 * 1024; // for 5MB  
  const upload=multer({
    storage:storage,
    fileFilter: (req, file, cb)=> {
      if(file.mimetype==="image/jpg"||
        file.mimetype==="image/png"||
        file.mimetype==="image/jpeg"||
        file.mimetype==="image/webp"      
      ){
        cb(null, true)
      }else{
        cb(null, false);
        return cb(new Error("Only jpg, png, jpeg and webp format is allowed"))
      }
    },
    limits: { fileSize: maxSize }
  }).fields([{ name: 'logo', maxCount: 1 }, { name: 'photo', maxCount: 8 }])
  upload(req,res, async(error)=> {  
    // console.log("req.fields", req.body);
    // console.log("req.files", req.files);
    const {name}=req.body

    const subject = await Subject.findByIdAndUpdate(
      req.params.subjectId,
      {
        ...req.body,
        slug: slugify(name),
        photo:{
              data:fs.readFileSync(req.files['photo'][0].path),
              contentType: req.files['photo'][0].mimetype
              },
        logo:{
              data:fs.readFileSync(req.files['logo'][0].path),
              contentType: req.files['logo'][0].mimetype
              }

      },
      { new: true }
    );
   
      res.json(subject);
    if (error instanceof multer.MulterError) {        
      res.status(400).json({
        status:"Fail",
        message:error.message
      })
    } else if (error) {      
      res.status(400).json({
        status:"Fail",
        message:error.message
      })
    } 
});   
  } catch (err) {
    console.log(err);
    res.status(400).json({
      err: err.message,
    });
  }
}



// exports.filteredSubjects = async (req, res) => {
//   try {
//     const { checked, radio,programRadio,countryRadio } = req.body;
//     console.log("testingggggg>>>>>>>>>",checked,radio,programRadio,countryRadio)

//     // let args = {};
//     // if (checked.length > 0) args.subjects.studyArea =  checked;
//     // if (radio.length) args.subjects.yearlyTuitionFees = { $gte: radio[0], $lte: radio[1] };
//     // if (programRadio.length) args.subjects.programLevel = { $gte: programRadio[0], $lte: programRadio[1] };
//     // console.log("args => ", args);

//     // const universities = await University.find(args).select("-photo").select("-logo");
//     //  const universities = await University.find({"subjects.studyArea":{$eq:checked}}).select("-photo").select("-logo");  // its working
//     //  const universities = await University.find({$and:[{"subjects.studyArea":{$eq:checked}},{"subjects.yearlyTuitionFees":{$gte:radio[0],$lte:radio[1]}}, {"subjects.programLevel":{$gte:programRadio[0],$lte:programRadio[1]}}]}).select("-photo").select("-logo");
//     //  const universities = await University.find({"subjects.studyArea":{$eq:checked}},{"subjects.yearlyTuitionFees":{$gte:radio[0],$lte:radio[1]}}, {"subjects.programLevel":{$gte:programRadio[0],$lte:programRadio[1]}}).select("-photo").select("-logo");
//     //  const universities = await University.find({"subjects.yearlyTuitionFees":{$gte:radio[0],$lte:radio[1]}}).select("-photo").select("-logo");  //its working
//     //  const universities = await University.find({"subjects.programLevel":{$gte:programRadio[0],$lte:programRadio[1]}}).select("-photo").select("-logo");  //it is working
//     //  const universities = await University.find({"subjects.studyArea":{$eq:checked},"subjects.yearlyTuitionFees":{$gte:radio[0],$lte:radio[1]},"subjects.programLevel":{$gte:programRadio[0],$lte:programRadio[1]}}).select("-photo").select("-logo"); // its working 
//     //  const universities = await University.find({$and:[{"subjects.studyArea":{$eq:checked}},{"subjects.yearlyTuitionFees":{$gte:radio[0],$lte:radio[1]}},{"subjects.programLevel":{$gte:programRadio[0],$lte:programRadio[1]}},{"subjects.country":{$gte:countryRadio[0],$lte:countryRadio[1]}}]}).select("-photo").select("-logo"); //  its finally working
//      const subjects = await Subject.find({$and:[{"subjects.studyArea":{$eq:checked}},{"subjects.yearlyTuitionFees":{$gte:radio[0],$lte:radio[1]}},{"subjects.programLevel":{$gte:programRadio[0],$lte:programRadio[1]}}]}).select("-photo").select("-logo"); //  its finally working
//     console.log("filtered subjects query => ", universities.length);
//     res.json(subjects);
//   } catch (err) {
//     console.log(err);
//   }
// };

// exports.filteredSubjects = async (req, res) => {
//   try {
//     const { checked, radio,programRadio,countryRadio } = req.body;
//     console.log("testingggggg>>>>>>>>>",checked,radio,programRadio,countryRadio)

//     // let args = {};
//     // if (checked.length > 0) args.subjects.studyArea =  checked;
//     // if (radio.length) args.subjects.yearlyTuitionFees = { $gte: radio[0], $lte: radio[1] };
//     // if (programRadio.length) args.subjects.programLevel = { $gte: programRadio[0], $lte: programRadio[1] };
//     // console.log("args => ", args);

//     // const universities = await University.find(args).select("-photo").select("-logo");
//     //  const universities = await University.find({"subjects.studyArea":{$eq:checked}}).select("-photo").select("-logo");  // its working
//     //  const universities = await University.find({$and:[{"subjects.studyArea":{$eq:checked}},{"subjects.yearlyTuitionFees":{$gte:radio[0],$lte:radio[1]}}, {"subjects.programLevel":{$gte:programRadio[0],$lte:programRadio[1]}}]}).select("-photo").select("-logo");
//     //  const universities = await University.find({"subjects.studyArea":{$eq:checked}},{"subjects.yearlyTuitionFees":{$gte:radio[0],$lte:radio[1]}}, {"subjects.programLevel":{$gte:programRadio[0],$lte:programRadio[1]}}).select("-photo").select("-logo");
//     //  const universities = await University.find({"subjects.yearlyTuitionFees":{$gte:radio[0],$lte:radio[1]}}).select("-photo").select("-logo");  //its working
//     //  const universities = await University.find({"subjects.programLevel":{$gte:programRadio[0],$lte:programRadio[1]}}).select("-photo").select("-logo");  //it is working
//     //  const universities = await University.find({"subjects.studyArea":{$eq:checked},"subjects.yearlyTuitionFees":{$gte:radio[0],$lte:radio[1]},"subjects.programLevel":{$gte:programRadio[0],$lte:programRadio[1]}}).select("-photo").select("-logo"); // its working 
//     //  const universities = await University.find({$and:[{"subjects.studyArea":{$eq:checked}},{"subjects.yearlyTuitionFees":{$gte:radio[0],$lte:radio[1]}},{"subjects.programLevel":{$gte:programRadio[0],$lte:programRadio[1]}},{"subjects.country":{$gte:countryRadio[0],$lte:countryRadio[1]}}]}).select("-photo").select("-logo"); //  its finally working
//     //  const filteredSubjects = await University.find({$and:[{"subjects.studyArea":{$eq:checked}},{"subjects.yearlyTuitionFees":{$gte:radio[0],$lte:radio[1]}},{"subjects.programLevel":{$gte:programRadio[0],$lte:programRadio[1]}}]},{subjects:{$elemMatch:{$eq:checked[0]},photo:0,logo:0}}).select("-photo").select("-logo"); //  its finally working
// //     const filteredSubjects=await University.aggregate([
// // {$project:{name:1,ranking:1,"subjects.studyArea":1, filteredSubjects:{$filter:{input:"$subjects.studyArea",as:"fs",cond:{$eq:["$$fs.studyArea",checked]}}}}}
// //     ])
// const filteredSubjects=await Subject.aggregate([
//   {$project:{subjects:1}},
// {$unwind:"$subjects"},
// // {$project:{"subjects.title":1,"subjects.intakes":1,sa:"$subjects.studyArea"}},
// // {$group:{_id:checked,title:{$first:"$subjects.title"},totalSubjects:{$sum:1}}},

// ])
// // console.log("fgdsfsds======>",filteredSubjects[0].subjects.studyArea)
// // console.log( typeof checked)
// // const newSa= new mongoose.Types.ObjectId(checked)
// // const newSa= new mongoose.Types.ObjectId(checked)
// // console.log("fdsfas",typeof newSa)
// const result=filteredSubjects.filter(s=>{
//  return  ((s.subjects.yearlyTuitionFees)>=radio[0] && (s.subjects.yearlyTuitionFees<=radio[1]) )

// })
// console.log(result)

//     // console.log("filtered subjects query => ", filteredSubjects.length,filteredSubjects);
//     res.json(filteredSubjects);
//   } catch (err) {
//     console.log(err);
//   }
// };



// query subjects by selecting study area, yearly tuition fees, program level and country 
exports.filteredSubjects=async(req,res)=>{
    try {
        const { checked } = req.body;
        console.log("studyArea yearlyTuitionFees ProgramLevel Country========>",checked);
        // const { checked, radio,programRadio,countryRadio } = req.body;
        // console.log("studyArea yearlyTuitionFees ProgramLevel Country========>",checked,radio,programRadio,countryRadio);

    // const result= await Subject.aggregate([
    //     { $match:{$and:[{studyArea:checked},{yearlyTuitionFees:{ $gte: radio[0], $lte: radio[1]}},{programLevel:{ $gte: programRadio[0], $lte: programRadio[1] }},{country:countryRadio}]} }
    // ])
    // const result= await Subject.aggregate([
    //     { $match:{$or:[{studyArea:checked},{yearlyTuitionFees:{ $gte: radio[0], $lte: radio[1]}},{programLevel:{ $gte: programRadio[0], $lte: programRadio[1] }},{country:countryRadio}]} },
    //     {$project:{ "title":1}}
    // ])
   
    const result= await Subject.aggregate([
       {$match:{studyArea:checked}},
      //  {$match:{yearlyTuitionFees:{ $gte: radio[0], $lte: radio[1]}}},
      //  {$match:{programLevel:{ $gte: programRadio[0], $lte: programRadio[1] }}},
      //  {$match:{country:countryRadio}},
       {$project:{ title:1}}
    ])
   
    console.log("filtered subjects=====>",result);
    res.json(result);

    } catch (error) {
        console.log(error)
    }
}







exports.subjectsSearch = async (req, res) => {
  try {
    const { keyword } = req.params;
    const results = await Subject.find({    
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { intakes: { $regex: keyword, $options: "i" } },
        { duration: { $regex: keyword, $options: "i" } },
        { programLevel: { $regex: keyword, $options: "i" } },
        { campus: { $regex: keyword, $options: "i" } },
        { subjectUrl: { $regex: keyword, $options: "i" } },
        { applicationDeadline: { $regex: keyword, $options: "i" } },
        { applicationFees: { $regex: keyword, $options: "i" } },
        // { yearlyTuitionFees: { $regex: keyword, $options: "i" } },
        //  { yearlyTuitionFees: { $regex: Number(keyword) } },
        { englishProficiency: { $regex: keyword, $options: "i" } },
        { languageScore: { $regex: keyword, $options: "i" } },
        { standardizedTest: { $regex: keyword, $options: "i" } },
        { entryRequirement: { $regex: keyword, $options: "i" } },
        { remarks: { $regex: keyword, $options: "i" } },
        { studyArea: { $regex: keyword, $options: "i" } },
        { university: { $regex: keyword, $options: "i" } },
        { country: { $regex: keyword, $options: "i" } },
    
      ],
    }).select("-photo").select("-logo");

    res.json(results);
  } catch (err) {
    console.log(err);
  }
};

exports.relatedSubjects = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const related = await Subject.find({    
      _id: { $ne: subjectId }
    })
      .select("-photo")
      .select("-logo")    
      .limit(3);

    res.json(related);
  } catch (err) {
    console.log(err);
  }
};

exports.subjectsCount = async (req, res) => {
    try {
      const total = await Subject.find({}).estimatedDocumentCount();
      res.json(total);
    } catch (err) {
      console.log(err);
    }
  };

  exports.listSubjects = async (req, res) => {
    try {
      const perPage = 6;
      const page = req.params.page ? req.params.page : 1;
  
      const subjects = await Subject.find({})
        .select("-photo")
        .select("-logo")
        .skip((page - 1) * perPage)
        .limit(perPage)
        .sort({ createdAt: -1 });
  
      res.json(subjects);
    } catch (err) {
      console.log(err);
    }
  };



exports.getToken = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (err) {
    console.log(err);
  }
};

exports.processPayment = async (req, res) => {
  try {
    // console.log(req.body);
    const { nonce, cart } = req.body;

    let total = 0;
    cart.map((i) => {
      total += i.price;
    });
    // console.log("total => ", total);

    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {
        if (result) {
          // res.send(result);
          // create order
          const order = new Order({
            products: cart,
            payment: result,
            buyer: req.user._id,
          }).save();
          // decrement quantity
          decrementQuantity(cart);
          // const bulkOps = cart.map((item) => {
          //   return {
          //     updateOne: {
          //       filter: { _id: item._id },
          //       update: { $inc: { quantity: -0, sold: +1 } },
          //     },
          //   };
          // });

          // Product.bulkWrite(bulkOps, {});

          res.json({ ok: true });
        } else {
          res.status(500).send(error);
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
};

const decrementQuantity = async (cart) => {
  try {
    // build mongodb query
    const bulkOps = cart.map((item) => {
      return {
        updateOne: {
          filter: { _id: item._id },
          update: { $inc: { quantity: -0, sold: +1 } },
        },
      };
    });

    const updated = await University.bulkWrite(bulkOps, {});
    console.log("blk updated", updated);
  } catch (err) {
    console.log(err);
  }
};

exports.orderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate("buyer", "email name");
    // send email

    // prepare email
    const emailData = {
      from: process.env.EMAIL_FROM,
      to: order.buyer.email,
      subject: "Order status",
      html: `
        <h1>Hi ${order.buyer.name}, Your order's status is: <span style="color:red;">${order.status}</span></h1>
        <p>Visit <a href="${process.env.CLIENT_URL}/dashboard/user/orders">your dashboard</a> for more details</p>
      `,
    };

    try {
      await sgMail.send(emailData);
    } catch (err) {
      console.log(err);
    }

    res.json(order);
  } catch (err) {
    console.log(err);
  }
};

// SERACH / FILTER

// query subjects by selecting only study area
const handleStudyArea=async(req,res,studyArea)=>{
  try {
  const result= await Subject.find({studyArea}).select("-photo").select("-logo")
  console.log(result);
  res.json(result);

  } catch (error) {
      console.log(error)
  }
}
// query subjects by selecting only Country
const handleCountry=async(req,res,country)=>{
  try {
  const result= await Subject.find({country}).select("-photo").select("-logo")
  console.log(result);
  res.json(result);

  } catch (error) {
      console.log(error)
  }
}
// query subjects by selecting only Yearly Tuition Fees
const handleYearlyTuitionFees=async(req,res,yearlyTuitionFees)=>{
  try {
  const result= await Subject.find({
    yearlyTuitionFees: {
      $gte: yearlyTuitionFees[0],
      $lte: yearlyTuitionFees[1],
    },
  }).select("-photo").select("-logo")
  console.log(result);
  res.json(result);

  } catch (error) {
      console.log(error)
  }
}

// query subjects by selecting only Program Level
const handleProgramLevel=async(req,res,programLevel)=>{
  try {
  const result= await Subject.find({programLevel}).select("-photo").select("-logo")
  console.log(result);
  res.json(result);

  } catch (error) {
      console.log(error)
  }
}


exports.searchFilters=async(req,res)=>{
  const {
    yearlyTuitionFees,
    studyArea,
    programLevel,
    country
   }=req.body;

   if (studyArea) {
    console.log("studyArea ---> ", studyArea);
    await handleStudyArea(req, res, studyArea);
  }
   if (programLevel) {
    console.log("programLevel ---> ", programLevel);
    await handleProgramLevel(req, res, programLevel);
  }
   if (country) {
    console.log("country ---> ", country);
    await handleCountry(req, res, country);
  }

  // yearlyTuitionFees [20, 200]
  if (yearlyTuitionFees !== undefined) {
    console.log("yearly tuition Fees ---> ", yearlyTuitionFees);
    await handleYearlyTuitionFees(req, res, yearlyTuitionFees);
  }
 
}

exports.searchByAllCondition=async(req,res)=>{
  try {
    const {searchStudyArea,searchCountry,searchYearlyTuitionFees,searchProgramLevel}=req.body;
  console.log(" searchStudyArea searchCountry searchYearlyTuitionFees searchProgramLevel======>",searchStudyArea,searchCountry,searchYearlyTuitionFees,searchProgramLevel);

  const result=await Subject.find({$and:[
    {programLevel:searchProgramLevel},
    {studyArea:searchStudyArea},
    {country:searchCountry},
    // {yearlyTuitionFees:searchYearlyTuitionFees}
    {yearlyTuitionFees: {
      $gte: searchYearlyTuitionFees[0],
      $lte: searchYearlyTuitionFees[1],
    }},
  ]}).select("-photo").select("-logo")

  console.log(result);
  res.json(result);
    
  } catch (error) {
    console.log(error);
    
  }
}

exports.compareShortListedSubject=async(req,res)=>{
  try {
    const {cart}=req.body

    const result= await Subject.find({_id:cart._id}).select("-photo").select("-logo")
    console.log(result);
    res.json(result);
  
    
  } catch (error) {
    
  }
}

 
  
 
