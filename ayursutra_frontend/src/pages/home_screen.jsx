import { useState } from "react";

export default function Home() {
  const [sessions, setSessions] = useState([]);
  const [form, setForm] = useState({ name: "", problem: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.problem) return;

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/agentic-ai/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch suggestion");
      }

      const data = await res.json();

      const aiSession = {
        name: form.name,
        problem: form.problem,
        therapy: data.therapy || "Suggested by AI",
        doctor: data.doctor || "Not Assigned",
        schedule: data.schedule || "Pending",
      };

      setSessions((prev) => [...prev, aiSession]);
      setForm({ name: "", problem: "" });
    } catch (error) {
      console.error("AI API Error:", error);
      alert("Could not fetch AI suggestion. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-green-300 p-6">
      <h1 className="text-3xl font-bold text-green-900 mb-6">
        AyurSutra - Panchakarma (AI Powered)
      </h1>

      {/* Booking Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md"
      >
        <h2 className="text-xl font-semibold mb-4">Describe Your Problem</h2>

        <input
          type="text"
          name="name"
          placeholder="Patient Name"
          value={form.name}
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded-md"
        />

        <textarea
          name="problem"
          placeholder="Describe your symptoms or problem"
          value={form.problem}
          onChange={handleChange}
          rows="3"
          className="w-full mb-3 p-2 border rounded-md"
        ></textarea>

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded-lg w-full hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Analyzing with AI..." : "Get AI Suggestion"}
        </button>
      </form>

      {/* Sessions List */}
      <div className="mt-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-2">AI Suggested Sessions</h2>
        {sessions.length === 0 ? (
          <p className="text-gray-600">No sessions suggested yet.</p>
        ) : (
          <ul className="space-y-2">
            {sessions.map((s, i) => (
              <li
                key={i}
                className="bg-white p-3 rounded-lg shadow-md flex flex-col"
              >
                <span className="font-medium">{s.name}</span>
                <span className="text-gray-700">
                  Problem: <em>{s.problem}</em>
                </span>
                <span className="text-green-700">
                  Therapy: {s.therapy} | Doctor: {s.doctor}
                </span>
                <span className="text-sm text-gray-500">
                  Schedule: {s.schedule}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
