
import { NextResponse } from "next/server";
import connecttoDB from '../route'
import faculty from '../faculty-registration/route'
export  async function POST(req) {
  try {
    const body = await req.json();
    const { regno, password } = await body;
    
   await connecttoDB().then(()=>console.log("connected to db")).catch((err)=>console.log(err))  
    const admins=await faculty.findOne({regno:regno});
    const passw=await faculty.findOne({password:password});
    
   
    
    if(!admins || !passw){
      return NextResponse.json({message:"Invalid credentials",status:401})
    }
    else{
      const response=NextResponse.json({
         success:true,
         admin:regno,
        message:"Login successful",
        status:200
      });
      response.cookies.set(
        
        process.env.AUTH_TOKEN,
        "true",
        {
          httpOnly:false,
          secure: process.env.NODE_ENV==="production",
          maxAge: 60*60*24,
          path:"/"
        }
      )
      console.log(response);
      console.log(typeof(response));
      
      
      return response;
    }
   
  }  
  catch(error){
    return NextResponse.json({message:"Error caught "+error,status:500})
  }  

 
}