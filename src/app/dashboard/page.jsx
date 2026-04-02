"use client"
import React, { useState, useEffect } from 'react'

export default function Dashboard() {

  const [data, setData] = useState({});

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const resp = await fetch('/backend');
        const final_data = await resp.json();
        console.log(final_data); // 🔍 debug
        setData(final_data);
      } catch (err) {
        console.log("Error:", err);
      }
    };

    fetchDetails();
  }, []);

  // ✅ Works for BOTH single object & multiple users
  const calculateSubjectAverages = (branchData) => {
    const subjectMap = {};

    // Convert to array if needed
    const users = Array.isArray(branchData)
      ? branchData
      : [branchData];

    users.forEach(user => {
      user?.feedback?.forEach(item => {

        if (!subjectMap[item.subject]) {
          subjectMap[item.subject] = [];
        }

        subjectMap[item.subject].push(...(item.ratings || []));
      });
    });

    return Object.keys(subjectMap).map(subject => {
      const ratings = subjectMap[subject];

      const avg = ratings.length
        ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2)
        : "No Ratings";

      return {
        subject,
        avg,
        totalRatings: ratings.length
      };
    });
  };

  return (
    <div className="container">
      <h1>Admin Dashboard</h1>
      <p>Welcome Admin</p>

      {
        Object.keys(data).map((branchKey, index) => {

          const branchData = data[branchKey];
          const subjects = calculateSubjectAverages(branchData);

          return (
            <div key={index} className="branch-container">
              <h2>{branchKey.toUpperCase()}</h2>

              <table className="styled-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Total Ratings</th>
                    <th>Average Rating</th>
                  </tr>
                </thead>

                <tbody>
                  {
                    subjects.length > 0 ? (
                      subjects.map((item, i) => (
                        <tr key={i}>
                          <td>{item.subject}</td>
                          <td>{item.totalRatings}</td>

                          <td
                            style={{
                              color:
                                item.avg !== "No Ratings" && item.avg > 1.5
                                  ? "green"
                                  : "red",
                              fontWeight: "bold"
                            }}
                          >
                            {item.avg}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3">No Data Available</td>
                      </tr>
                    )
                  }
                </tbody>
              </table>
            </div>
          );
        })
      }

      {/* ✅ STYLING */}
      <style jsx>{`
        .container {
          padding: 40px;
          font-family: Arial, sans-serif;
        }

        h1 {
          margin-bottom: 10px;
        }

        .branch-container {
          margin-bottom: 40px;
        }

        h2 {
          margin-bottom: 10px;
          color: #333;
        }

        .styled-table {
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 15px;
          width: 100%;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .styled-table thead tr {
          background-color: #009879;
          color: #ffffff;
          text-align: left;
          font-weight: bold;
        }

        .styled-table th,
        .styled-table td {
          padding: 12px 15px;
        }

        .styled-table tbody tr {
          border-bottom: 1px solid #dddddd;
        }

        .styled-table tbody tr:nth-child(even) {
          background-color: #f3f3f3;
        }

        .styled-table tbody tr:hover {
          background-color: #d1f7ef;
          transition: 0.2s;
        }

        .styled-table tbody tr:last-of-type {
          border-bottom: 2px solid #009879;
        }

        .styled-table td[colspan="3"] {
          text-align: center;
          font-weight: bold;
          color: #777;
        }
      `}</style>
    </div>
  );
}