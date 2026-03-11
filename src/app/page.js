"use client"

import questions from "../components/questions.json"
import styles from "./page.module.css"
import { useState } from "react"
import collegelogo from "./../../public/logooobbbb.png"
import ce_subjects from "../components/CE_7th_Sem_Subjects.json"
import cse_subjects from "../components/AIML_7th_Sem_Subjects.json"
import ece_subjects from "../components/ECE_7th_Sem_Subjects.json"
import me_subjects from "../components/ME_7th_Sem_Subjects.json"
import Image from "next/image"

export default function Home() {

  const [username,setUsername] = useState("")
  const [regno,setRegno] = useState("")
  const [branch,setBranch] = useState("")
  const [semester,setSemester] = useState("")
const [buttonText,setbuttonText]=useState("Submit feedback")
  const [marks,setMarks] = useState([])

  const subjects =
    branch === "CE"
      ? ce_subjects
      : branch === "ECE"
      ? ece_subjects
      : branch === "CSE(AIML)"
      ? cse_subjects
      : branch === "ME"
      ? me_subjects
      : []

  const handleAdd = (value,subjectIndex,questionIndex) => {

    const newMarks = [...marks]

    if(!newMarks[subjectIndex]){
      newMarks[subjectIndex] = []
    }

    newMarks[subjectIndex][questionIndex] = value

    setMarks(newMarks)

  }

  const handleSubmit = async(e)=>{

    e.preventDefault()
    setbuttonText("Submitting...")

    const feedback = subjects.map((sub,i)=>({

      subject: sub.subject_name,
      ratings: marks[i] || []

    }))

    const data = {

      username,
      regno,
      branch,
      semester,
      feedback

    }
    //console.log(data);
    

    try{

      const res = await fetch("/backend",{

        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify(data)

      })

      const response = await res.json()

      console.log(response)

      alert("Feedback submitted successfully!")
      setbuttonText("Submit feedback")

    }

    catch(err){

      console.error(err)
      alert("Submission failed")

    }
    setUsername("")
    setRegno("")
    setBranch("")
    setSemester("")
    setMarks([])

  }

  return(

    <div className={styles.page}>

      <form onSubmit={handleSubmit}>

        <Image
        src={collegelogo}
        width={150}
        height={150}
        alt="GEC Aurangabad logo"
        style={{display:"block",margin:"auto"}}
        />

       
        <h3>Government Engineering College Aurangabad</h3>

        <main className={styles.main}>

          <input
          type="text"
          value={username}
          placeholder="Enter your name"
          onChange={(e)=>setUsername(e.target.value)}
          required
          />

          <input
          type="number"
          value={regno}
          placeholder="Enter registration number"
          onChange={(e)=>setRegno(e.target.value)}
          required
          />

          <select
          value={branch}
          onChange={(e)=>setBranch(e.target.value)}
          required
          >

            <option value="">Choose branch</option>
            <option value="CSE(AIML)">CSE (AIML)</option>
            <option value="ECE">ECE</option>
            <option value="CE">Civil Engineering</option>
            <option value="ME">Mechanical Engineering</option>
          </select>

          <select
          value={semester}
          onChange={(e)=>setSemester(e.target.value)}
          required
          >

            <option value="">Choose semester</option>
            <option value="7">7th Semester</option>

          </select>

          <div className="questionsSection">

            {subjects.map((sub,sIndex)=>(

              <div className="subjectCard" key={sIndex}>

                <h3 className="subjectTitle">
                  {sub.subject_name}
                </h3>

                <div className="ratingHeader">

                  <div></div>
                  <div>Very Poor</div>
                  <div>Poor</div>
                  <div>Okay</div>
                  <div>Good</div>
                  <div>Very Good</div>

                </div>

                {questions.map((q,qIndex)=>(

                  <div className="questionRow" key={qIndex}>

                    <div className="questionText">
                      {q.question}
                    </div>

                    {[1,2,3,4,5].map((value)=>(

                      <div className="radioCell" key={value}>

                        <input
                        type="radio"
                        name={`sub-${sIndex}-q-${qIndex}`}
                        value={value}
                        checked={marks[sIndex]?.[qIndex] == value}
                        onChange={()=>handleAdd(value,sIndex,qIndex)}
                        />

                      </div>

                    ))}

                  </div>

                ))}

              </div>

            ))}

          </div>

          <button type="submit">
           {buttonText}
          </button>

        </main>

      </form>

    </div>

  )

}