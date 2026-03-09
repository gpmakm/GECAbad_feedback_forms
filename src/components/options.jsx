"use client"

import {React,useState} from 'react'

const Options = ({branch,setBranch,semester,setSemester}) => {
    
  const [subject,setSubject]=useState("");
const handleSubmitSub=(e)=>{
    e.preventDefault();
    console.log(branch+"\n"+semester);
    
}
  return (
    <div>
        <div className="field">
            <select name="branch" value={branch} id="branch" className="field" onChange={(e)=>{setBranch(e.target.value)}} required>
                <option value="none">Choose branch</option>
                <option value="CSE(DS)" className="field">Comp. Sci. & Engg.(DS)</option>
                <option value="CSE(AIML)" className="field">Comp. Sci. & Engg.(AIML)</option>
                <option value="EE" className="field">Electrical Engineering</option>
                <option value="ME" className="field">Mechanical Engineering</option>
                <option value="ECE" className="field">Electronics and Communication Engineering</option>
                <option value="CE" className="field">Civil Engineering</option>
            </select>
        </div>
        <div className="field">
            <select name="field" id="field" className="field" value={semester} onChange={(e)=>{setSemester(e.target.value)}} required>
                <option value="none">Choose semester</option>
                <option value="1">1st Semester</option>
                <option value="2">2nd Semester</option>
                <option value="3">3rd Semester</option>
                <option value="4">4th Semester</option>
                <option value="5">5th Semester</option>
                <option value="6">6th Semester</option>
                <option value="7">7th Semester</option>
                <option value="8">8th Semester</option>
            </select>
        </div>
    </div>
  )
}

export default Options