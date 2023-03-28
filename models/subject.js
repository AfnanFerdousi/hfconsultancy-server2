const mongoose =require("mongoose");

const subjectSchema = new mongoose.Schema({
  // done
    title: {
        type: String,
        trim: true,
        minlength: 3,
        maxlength: 320,
        required: true,
        unique: true,
             
      },
      slug: {
        type: String,
        lowercase: true,        
      },
      // done
      photo: {
        data: Buffer,
        contentType: String,
  }, 
      // uni logo
      // done
    logo: {
        data: Buffer,
        contentType: String,
  },
    // cors desc
    // done
      description:{
        type: String,
       
  },
      // cors in
      // done
      intakes:{
          type: String,
          required:true,
         
      },
      // done
      duration:{
          type: String,
          required:true,
        
  },
      // done
      programLevel:{
        type: String,
        enum: ["Foundation","Under Graduate","Post Graduate",],
        default: ["Under Graduate"],
      
  },
      // uni place
      // done
      campus:{
          type: String,            
  },
      // uni cors link
      // done
      subjectUrl:{
          type: String,
          lowercase: true,
          
      },
      // done
      applicationDeadline:{
          type: String,
             
      },
      // done
      applicationFees:{
          type: String,
         
      },
      // done
      yearlyTuitionFees: {
        type: Number,
        trim: true,
        required: [true, "Tuition Fee is required"],
  },
      // done
      englishProficiency:{
          type: [String],
          enum: ["IELTS","OIETC","TOEFL","DUOLINGO","SAT","GRE","GMAT"],
          default: ["IELTS"],
        
  },
      // done
      languageScore:{
          type:String,
            
      },
      // done
      standardizedTest:{
          type:String,
                 
      },
      // done
      entryRequirement:{
          type:String,
              
  },
      // done
      remarks:{
          type:String,
        
      },
      // done
      address:{
        type:String,
      
      },
      // done
      webUrl:{
        type:String,
      
      },
      // done
      ranking:{
        type:String,
       
  },
      // done
      studyArea: {
        type: String,
        trim: true,
        minlength: 3,
        maxlength: 320,
        required: true,
       
      },
      // done
      country: {
        type: String,
        trim: true,
        minlength: 2,
        maxlength: 320,
        required: true,
       
  },
      // done
      university: {
        type: String,
        trim: true,
        minlength: 3,
        maxlength: 320,
        required: true,
       
      },
      

}, { timestamps: true,versionKey: false });

subjectSchema.index({'$**': 'text'});

module.exports= mongoose.model("Subject", subjectSchema);