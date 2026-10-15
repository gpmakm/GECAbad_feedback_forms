"use client";

import React, {
  useState,
  useEffect,
  useRef,
  Suspense
} from "react";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useSearchParams } from "next/navigation";

function DashboardContent() {
  const searchParams = useSearchParams();
  const adminName = searchParams.get("admin") || "Admin";

  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [pdfStatus, setPdfStatus] = useState("Not started");
  const [debugLogs, setDebugLogs] = useState([]);

  const pdfRef = useRef(null);

  // Record diagnostics in the browser console and on screen.
  const logDebug = (message, details = null) => {
    const timestamp = new Date().toLocaleTimeString();

    console.log(`[Dashboard ${timestamp}] ${message}`, details ?? "");

    setDebugLogs((previous) => [
      ...previous,
      {
        id: `${Date.now()}-${previous.length}`,
        timestamp,
        message,
        details:
          details === null
            ? ""
            : typeof details === "string"
              ? details
              : JSON.stringify(details, null, 2)
      }
    ].slice(-30));
  };

  // Fetch feedback from the backend.
  useEffect(() => {
    let cancelled = false;

    async function fetchDetails() {
      

      try {
        const response = await fetch("/backend", {
          method: "GET",
          headers: {
            Accept: "application/json"
          },
          cache: "no-store"
        });

       

        if (!response.ok) {
          const responseText = await response.text();

          throw new Error(
            `API returned HTTP ${response.status}. ` +
            `Response: ${responseText.slice(0, 500)}`
          );
        }

        const contentType =
          response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
          const responseText = await response.text();

          throw new Error(
            "Expected JSON but received a different response. " +
            `Response preview: ${responseText.slice(0, 300)}`
          );
        }

        const result = await response.json();

        if (
          result === null ||
          typeof result !== "object" ||
          Array.isArray(result)
        ) {
          throw new Error(
            "Invalid API data. Expected a JSON object keyed by branch."
          );
        }

        if (!cancelled) {
          setData(result);

          logDebug("API data loaded successfully", {
            branchKeys: Object.keys(result),
            branchCount: Object.keys(result).length
          });
        }
      } catch (error) {
        console.error("Dashboard API error:", error);

        if (!cancelled) {
          setApiError(
            error instanceof Error
              ? error.message
              : String(error)
          );

          logDebug("API request failed", {
            message:
              error instanceof Error
                ? error.message
                : String(error)
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchDetails();

    return () => {
      cancelled = true;
    };
  }, []);

  // Safely calculate average ratings.
  const calculateSubjectAverages = (branchData) => {
    const subjectMap = {};

    const users = Array.isArray(branchData)
      ? branchData
      : branchData && typeof branchData === "object"
        ? [branchData]
        : [];

    users.forEach((user, userIndex) => {
      if (!user || typeof user !== "object") {
        console.warn("Invalid user entry:", userIndex, user);
        return;
      }

      const feedback = Array.isArray(user.feedback)
        ? user.feedback
        : [];

      feedback.forEach((item) => {
        if (!item || typeof item !== "object") {
          console.warn("Invalid feedback entry:", item);
          return;
        }

        const subject = item.subject;

        if (!subject) {
          console.warn("Feedback entry has no subject:", item);
          return;
        }

        if (!subjectMap[subject]) {
          subjectMap[subject] = [];
        }

        const ratings = Array.isArray(item.ratings)
          ? item.ratings
          : [];

        ratings.forEach((rating) => {
          const numericRating = Number(rating);

          if (
            rating !== null &&
            rating !== "" &&
            Number.isFinite(numericRating)
          ) {
            subjectMap[subject].push(numericRating);
          }
        });
      });
    });

    return Object.entries(subjectMap).map(
      ([subject, ratings]) => ({
        subject,
        avg: ratings.length
          ? (
              ratings.reduce((sum, rating) => sum + rating, 0) /
              ratings.length
            ).toFixed(2)
          : "No Ratings",
        totalRatings: ratings.length
      })
    );
  };

  // Export the dashboard as PDF.
  const downloadPDF = async () => {
    logDebug("PDF export started");

    const element = pdfRef.current;

    if (!element) {
      const message = "PDF element not found in the page.";

      setPdfStatus(message);
      logDebug(message);
      return;
    }

    try {
      setPdfStatus("Generating PDF...");

      logDebug("Creating dashboard canvas");

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: true
      });

      if (!canvas.width || !canvas.height) {
        throw new Error("Canvas has zero width or height.");
      }

     

      const { jsPDF } = await import("jspdf");

      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imageData = canvas.toDataURL("image/png");
      const imageHeight =
        (canvas.height * pageWidth) / canvas.width;

      let heightLeft = imageHeight;
      let position = 0;

      pdf.addImage(
        imageData,
        "PNG",
        0,
        position,
        pageWidth,
        imageHeight
      );

      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imageHeight;

        pdf.addPage();

        pdf.addImage(
          imageData,
          "PNG",
          0,
          position,
          pageWidth,
          imageHeight
        );

        heightLeft -= pageHeight;
      }

      pdf.save("dashboard-debug-report.pdf");

      setPdfStatus("PDF exported successfully.");
      logDebug("PDF saved successfully");
    } catch (error) {
      console.error("PDF export error:", error);

      const message =
        error instanceof Error
          ? error.message
          : String(error);

      setPdfStatus(`PDF export failed: ${message}`);
      logDebug("PDF export failed", message);
    }
  };

  return (
    <main className="container">
      <h1>Admin Dashboard</h1>

      <p>Welcome, {adminName}!</p>

      <div className="actions">
        <button
          className="btn"
          onClick={downloadPDF}
          disabled={loading || !!apiError}
        >
          Export as PDF
        </button>

        <button
          className="btn clear-btn"
          onClick={() =>
            alert(
              "Database deletion is disabled in debugging mode."
            )
          }
        >
          Export and Clear Database
        </button>
      </div>

      

      {/* Content captured in the PDF */}
      {!loading && !apiError && (
        <div ref={pdfRef} className="pdf-content">
          <h2>Feedback Report</h2>
          <p>Prepared for: {adminName}</p>

          {Object.keys(data).length === 0 && (
            <p>No feedback data available.</p>
          )}

          {Object.entries(data).map(
            ([branchKey, branchData]) => {
              let subjects = [];

              try {
                subjects =
                  calculateSubjectAverages(branchData);
              } catch (error) {
                console.error(
                  `Failed to calculate averages for ${branchKey}:`,
                  error
                );
              }

              return (
                <section
                  key={branchKey}
                  className="branch-container"
                >
                  <h3>{branchKey.toUpperCase()}</h3>

                  <table className="styled-table">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Total Ratings</th>
                        <th>Average Rating</th>
                      </tr>
                    </thead>

                    <tbody>
                      {subjects.length ? (
                        subjects.map((item) => (
                          <tr key={item.subject}>
                            <td>{item.subject}</td>
                            <td>{item.totalRatings}</td>
                            <td>{item.avg}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3}>
                            No Data Available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </section>
              );
            }
          )}
        </div>
      )}

      {loading && <p>Loading feedback data...</p>}

     

      <style jsx>{`
        .container {
          padding: 30px;
          font-family: Arial, sans-serif;
          color: #222;
        }

        .actions,
        .log-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin: 18px 0;
        }

        .btn {
          padding: 10px 16px;
          border: none;
          border-radius: 5px;
          background: #009879;
          color: white;
          cursor: pointer;
        }

        .btn:hover {
          background: #007f67;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .clear-btn {
          background: #dc2626;
        }

        .debug-panel {
          margin: 20px 0;
          padding: 16px;
          border: 1px solid #ccc;
          border-radius: 8px;
          background: #f8fafc;
          overflow-wrap: anywhere;
        }

        .pdf-content {
          padding: 20px;
          background: white;
          color: #222;
        }

        .branch-container {
          margin-bottom: 35px;
        }

        .styled-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }

        .styled-table th,
        .styled-table td {
          padding: 10px;
          border: 1px solid #ddd;
          text-align: left;
        }

        .styled-table thead {
          background: #009879;
          color: white;
        }

        .styled-table tbody tr:nth-child(even) {
          background: #f3f3f3;
        }

        .error {
          color: #b91c1c;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        .log-entry {
          padding: 10px 0;
          border-bottom: 1px solid #ddd;
        }

        .log-entry pre {
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          font-size: 12px;
        }

        @media (max-width: 600px) {
          .container {
            padding: 12px;
          }

          .styled-table th,
          .styled-table td {
            padding: 6px;
            font-size: 12px;
          }
        }
      `}</style>
    </main>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<p>Loading dashboard...</p>}>
      <DashboardContent />
    </Suspense>
  );
}