"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Login() {

  const router = useRouter()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async (e) => {

    e.preventDefault()

    try {

      const res = await fetch("/backend/admin", {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          username,
          password
        })

      })

      const data = await res.json()

      if (data.success) {

        alert("Login Successful")

        window.location.href="/dashboard"

      } else {

        alert(data.message)

      }

    } catch (err) {

      console.log(err)
      alert("Login failed")

    }

  }

  return (

    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(135deg,#eef2ff,#f8f9ff)"
    }}>

      <form
        onSubmit={handleLogin}
        style={{
          width: "350px",
          background: "white",
          padding: "30px",
          borderRadius: "10px",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          boxShadow: "0 10px 20px rgba(0,0,0,0.1)"
        }}
      >

        <h2 style={{ textAlign: "center" }}>Admin Login</h2>

        <input
          type="text"
          placeholder="Enter Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{
            height: "40px",
            padding: "8px",
            borderRadius: "5px",
            border: "1px solid #ccc"
          }}
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            height: "40px",
            padding: "8px",
            borderRadius: "5px",
            border: "1px solid #ccc"
          }}
        />

        <button
          type="submit"
          style={{
            height: "40px",
            background: "blueviolet",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Login
        </button>

      </form>

    </div>

  )

}