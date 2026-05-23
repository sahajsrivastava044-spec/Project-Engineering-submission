import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      // No minlength, no select: false, no pre-save hook
      // minLength:6,
      select:false
    },
  },
  { timestamps: true }
)
// userSchema.pre('save',async function(next){
//   if(!this.isModified('password')){
//     next();
//   }
//   this.password=await bcrypt.hash(this.password,userSchema.password);
//   next();
// })

export default mongoose.model('User', userSchema)
