import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  User,
  FileText,
  Calendar,
  Stethoscope,
  Flower,
  Star,
} from "lucide-react";

export default function AyurSutra() {
  const [form, setForm] = useState({ name: '', problem: '', priority: 'Medium' });
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // slight delay so mount animations look smoother
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.problem) return;

    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/agentic-ai/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error("Failed to fetch recommendations");

      const data = await response.json();

      const newSession = {
        id: Date.now(),
        name: form.name,
        problem: form.problem,
        therapy: data.therapy,
        doctor: `${data.doctor_name} (${data.speciality})`,
        schedule: `${data.schedule} | Available: ${data.available_days} ${data.available_time}`,
        priority: form.priority  
      };

      setSessions((prev) => [newSession, ...prev]);
      setForm({ name: "", problem: "", priority: "Medium" });
    } catch (err) {
      console.error("Error fetching recommendations:", err);
    } finally {
      setLoading(false);
    }
  };


  // --- framer-motion variants ---
  const pageVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.06, when: "beforeChildren" },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
  };

  const blobAnim = { y: [0, -18, 0] };
  const blobTrans = { duration: 8, repeat: Infinity, ease: "easeInOut" };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#051c14] via-[#0d2e23] to-[#12382c] relative overflow-hidden text-white">
      {/* animated gradient blobs (background) */}
      <motion.div className="absolute inset-0 pointer-events-none" aria-hidden>
        <motion.div
          className="absolute top-24 left-16 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl"
          style={{ background: "linear-gradient(90deg, rgba(16,185,129,0.12), rgba(34,197,94,0.10))" }}
          animate={mounted ? blobAnim : { y: 0 }}
          transition={blobTrans}
        />

        <motion.div
          className="absolute top-40 right-16 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl"
          style={{ background: "linear-gradient(90deg, rgba(34,197,94,0.10), rgba(132,204,22,0.08))" }}
          animate={mounted ? { y: [0, -12, 0] } : { y: 0 }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="absolute bottom-20 left-1/3 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl"
          style={{ background: "linear-gradient(90deg, rgba(16,185,129,0.09), rgba(34,197,94,0.08))" }}
          animate={mounted ? { y: [0, -8, 0] } : { y: 0 }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      <motion.main
        className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6"
        initial="hidden"
        animate={mounted ? "visible" : "hidden"}
        variants={pageVariants}
      >
        {/* Heading */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <div className="flex items-center justify-center mb-6 relative">
            <div className="relative bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 p-4 rounded-3xl shadow-2xl border border-green-400/40 backdrop-blur-xl">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Flower className="w-12 h-12 text-green-200" />
              </motion.div>
              <div className="absolute -top-2 -right-2">
                <Star className="w-6 h-6 text-lime-300" />
              </div>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-black mb-3">
            <span className="bg-gradient-to-r from-green-300 via-emerald-300 to-lime-300 bg-clip-text text-transparent">
              AyurSutra
            </span>
          </h1>
          <p className="text-lg md:text-xl text-green-200/80">AI Powered Panchakarma Therapy</p>
        </motion.div>

        {/* Form + Recommendations */}
        <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-12">
          {/* Left: Form */}
          <motion.section variants={itemVariants} className="transform">
            <div className="bg-green-900/20 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl border border-green-500/30 hover:border-green-400 transition-all duration-500">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-2xl mr-4 shadow-lg">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold">Consultation Portal</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-green-200 mb-2">Patient Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-400 w-6 h-6" />
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className="w-full pl-14 pr-4 py-3 bg-green-950/30 border border-green-400/30 rounded-2xl focus:ring-2 focus:ring-green-400 text-green-100"
                    />
                  </div>
                </div>  

                {/* Priority Dropdown */}
                <div>
                  <label className="block text-sm font-semibold text-green-200 mb-2">
                    Priority Level
                  </label>
                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    className="w-full p-4 bg-green-950/30 border border-green-400/30 rounded-2xl focus:ring-2 focus:ring-green-400 text-green-100"
                  >
                    <option value="High" className="bg-white text-black">
                      High - Emergency (Heart, severe issue)
                    </option>
                    <option value="Medium" className="bg-white text-black">
                      Medium - Moderate concern
                    </option>
                    <option value="Low" className="bg-white text-black">
                      Low - Mild issue
                    </option>
                  </select>
                </div>


                <div>
                  <label className="block text-sm font-semibold text-green-200 mb-2">Describe Your Symptoms</label>
                  <textarea
                    name="problem"
                    value={form.problem}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Please describe your symptoms..."
                    className="w-full p-4 bg-green-950/30 border border-green-400/30 rounded-2xl focus:ring-2 focus:ring-green-400 text-green-100 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !form.name || !form.problem}
                  className="w-full bg-gradient-to-r from-green-700 via-emerald-700 to-teal-700 text-white font-bold py-3 px-5 rounded-2xl disabled:opacity-50"
                >
                  {loading ? "Analyzing..." : (
                    <div className="flex items-center justify-center gap-3">
                      <Sparkles className="w-5 h-5 text-green-300" />
                      <span>Get AI-Powered Recommendation</span>
                    </div>
                  )}
                </button>
              </form>
            </div>
          </motion.section>

          {/* Right: Recommendations */}
          <motion.section variants={itemVariants} className="transform">
            <div className="bg-green-900/20 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl border border-green-500/30">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-4 rounded-2xl mr-4 shadow-lg">
                  <Stethoscope className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold">AI Recommendations</h2>
              </div>

              {sessions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-400/30">
                    <Calendar className="w-10 h-10 text-green-300/60" />
                  </div>
                  <p className="text-green-200 text-lg font-semibold mb-1">No recommendations yet</p>
                  <p className="text-green-200/70">Submit the form to get personalized AI suggestions</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <AnimatePresence>
                    {sessions.map((session) => (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.35 }}
                        className="bg-green-800/30 p-4 rounded-2xl border border-green-400/30 shadow-xl"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center">
                            <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-10 h-10 rounded-full flex items-center justify-center mr-4">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-green-100">{session.name}</h3>
                              <p className="text-sm text-green-300/70">Patient</p>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              session.priority === "High"
                                ? "bg-red-600 text-white"
                                : session.priority === "Medium"
                                ? "bg-orange-500 text-white"
                                : "bg-yellow-400 text-black"
                            }`}
                          >
                            {session.priority} Priority
                          </span>
                          <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold">NEW</span>
                        </div>

                        <div className="space-y-3">
                          <div className="bg-green-950/40 border-l-4 border-green-400 p-3 rounded-r-xl">
                            <p className="text-sm text-green-200 font-semibold mb-1">Symptoms:</p>
                            <p className="text-green-100 italic">"{session.problem}"</p>
                          </div>

                          <div className="bg-green-700/40 border-l-4 border-green-400 p-3 rounded-r-xl">
                            <p className="text-sm text-green-200 font-semibold mb-1">Recommended Therapy:</p>
                            <p className="text-green-100 font-bold">{session.therapy}</p>
                          </div>

                          <div className="flex justify-between items-center pt-3 border-t border-green-500/30">
                            <div className="flex items-center text-green-200/80">
                              <Stethoscope className="w-4 h-4 mr-2" />
                              <span className="font-semibold">{session.doctor}</span>
                            </div>
                            <div className="flex items-center text-green-200/80">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span>{session.schedule}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.section>
        </div>

        {/* footer */}
        <motion.div variants={itemVariants} className="mt-12 text-center">
          <p className="text-green-300/80">Powered by AI technology for personalized Ayurvedic care</p>
        </motion.div>
      </motion.main>
    </div>
  );
}
