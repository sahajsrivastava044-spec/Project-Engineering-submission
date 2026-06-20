import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // console.log(decoded)
      req.user = await User.findById(decoded.userId).select('-password');
      // console.log(req.user.role);
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }

};

function allowedRoles(...roles){
  return (req,res,next)=>{
    // console.log(req.user.role)
    // console.log(roles);
      if(roles.includes(req.user.role)){
        // console.log(true)
        next()
      }else{
        console.log(false)
        return res.status(403).json({"message":"Not authorized, token failed"})
      }
  }
}

export { protect ,allowedRoles};
