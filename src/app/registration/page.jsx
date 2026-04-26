"use client";

import React, { useState } from "react";

const Page = () => {
  const [formData, setFormData] = useState({
    fname: "",
    regno: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    console.log("Form Data:", formData);
  };

  return (
    <div className="faculty-reg-container">
      <form className="faculty-reg-form" onSubmit={handleSubmit}>
        <h2 className="faculty-reg-title">Register</h2>

        <input
          type="text"
          name="fname"
          placeholder=" Name"
          value={formData.fname}
          onChange={handleChange}
          className="faculty-reg-input faculty-reg-fname"
          required
        />

        <input
          type="text"
          name="regno"
          placeholder="Registration Number"
          value={formData.regno}
          onChange={handleChange}
          className="faculty-reg-input faculty-reg-regno"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Create Password"
          value={formData.password}
          onChange={handleChange}
          className="faculty-reg-input faculty-reg-password"
          required
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="faculty-reg-input faculty-reg-confirm-password"
          required
        />

        {error && <p className="faculty-reg-error">{error}</p>}

        <button type="submit" className="faculty-reg-button">
          Register
        </button>
      </form>
    </div>
  );
};

export default Page;