"use client"
import React, { useState, useEffect, useRef } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export default function Dashboard() {

  const [data, setData] = useState({});
  const pdfRef = useRef(); // 🔥 reference for PDF

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const resp = await fetch('/backend');
        const final_data = await resp.json();
        setData(final_data);
      } catch (err) {
        console.log("Error:", err);
      }
    };

    fetchDetails();
  }, []);

  // ✅ Average calculation
  const calculateSubjectAverages = (branchData) => {
    const subjectMap = {};

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

  // ✅ PDF FUNCTION
  const downloadPDF = async () => {
    const element = pdfRef.current;

    const canvas = await html2canvas(element, {
      scale: 2
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save("dashboard-report.pdf");
  };

  return (
    <div className="container">

      <h1>Admin Dashboard</h1>
      <p>Welcome Admin</p>

      {/* 🔥 Export Button */}
      <button className="btn" onClick={downloadPDF}>
        Export as PDF
      </button>

      {/* 🔥 CONTENT TO EXPORT */}
      <div ref={pdfRef}>

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
                            <td>{item.avg}</td>
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

      </div>

      {/* ✅ STYLING */}
      <style jsx>{`
        .container {
          padding: 40px;
          font-family: Arial;
        }

        .btn {
          margin: 20px 0;
          padding: 10px 20px;
          background: #009879;
          color: white;
          border: none;
          cursor: pointer;
          border-radius: 5px;
        }

        .btn:hover {
          background: #007f67;
        }

        .branch-container {
          margin-bottom: 40px;
        }

        .styled-table {
          border-collapse: collapse;
          width: 100%;
          margin-top: 10px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .styled-table th,
        .styled-table td {
          padding: 10px;
        }

        .styled-table thead {
          background: #009879;
          color: white;
        }

        .styled-table tbody tr:nth-child(even) {
          background: #f3f3f3;
        }

        .styled-table tbody tr:hover {
          background: #d1f7ef;
        }
      `}</style>
    </div>
  );
}