// display users eco data and progress and impact analytics

import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { Line } from "react-chartjs-2";
import "./ImpactTracker.css";

const ImpactTracker = () => {
  const { user } = useAuth();
  const [impact, setImpact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState("month");

  useEffect(() => {
    fetchImpactData();
  }, [timeframe, user]);

  const fetchImpactData = async () => {
    try {
      const response = await fetch(`/api/impact?timeframe=${timeframe}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch impact data");

      const data = await response.json();
      setImpact(data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const chartData = {
    labels: impact?.timeline.map((t) => t.date) || [],
    datasets: [
      {
        label: "Carbon Saved (kg)",
        data: impact?.timeline.map((t) => t.carbonSaved) || [],
        borderColor: "#2ecc71",
        fill: false,
      },
      {
        label: "Water Saved (L)",
        data: impact?.timeline.map((t) => t.waterSaved) || [],
        borderColor: "#3498db",
        fill: false,
      },
    ],
  };

  if (loading) return <div>Loading impact data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="impact-tracker">
      <h2>Your Eco Impact</h2>

      <div className="timeframe-selector">
        <button
          className={timeframe === "month" ? "active" : ""}
          onClick={() => setTimeframe("month")}
        >
          Month
        </button>
        <button
          className={timeframe === "year" ? "active" : ""}
          onClick={() => setTimeframe("year")}
        >
          Year
        </button>
        <button
          className={timeframe === "all" ? "active" : ""}
          onClick={() => setTimeframe("all")}
        >
          All Time
        </button>
      </div>

      <div className="impact-stats">
        <div className="stat-card">
          <h3>Total Carbon Saved</h3>
          <p>{impact.totalCarbonSaved}kg</p>
          <span>Equivalent to {impact.carbonEquivalent} trees planted</span>
        </div>

        <div className="stat-card">
          <h3>Total Water Saved</h3>
          <p>{impact.totalWaterSaved}L</p>
          <span>Equivalent to {impact.waterEquivalent} showers</span>
        </div>

        <div className="stat-card">
          <h3>Plastic Reduced</h3>
          <p>{impact.totalPlasticReduced}kg</p>
          <span>Equivalent to {impact.plasticEquivalent} plastic bottles</span>
        </div>
      </div>

      <div className="impact-chart">
        <Line
          data={chartData}
          options={{
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          }}
        />
      </div>

      <div className="impact-badges">
        <h3>Your Eco Badges</h3>
        <div className="badge-grid">
          {impact.badges.map((badge) => (
            <div
              key={badge.id}
              className={`badge ${badge.achieved ? "achieved" : ""}`}
            >
              <img src={badge.icon} alt={badge.name} />
              <h4>{badge.name}</h4>
              <p>{badge.description}</p>
              {!badge.achieved && (
                <div className="progress-bar">
                  <div
                    className="progress"
                    style={{
                      width: `${(badge.progress / badge.target) * 100}%`,
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImpactTracker;
