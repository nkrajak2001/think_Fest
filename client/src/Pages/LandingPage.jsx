import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  MapPin,
  CalendarCheck,
  Shield,
  CreditCard,
  Bell,
  BarChart3,
  ArrowRight,
  UserPlus,
  Search,
  Car,
  ChevronDown,
} from 'lucide-react';

/* ───────────────────── Animated Counter ───────────────────── */
function AnimatedStat({ value, label }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="text-center"
    >
      <div className="text-4xl md:text-5xl font-extrabold text-yellow-400">{value}</div>
      <div className="text-xs uppercase tracking-widest text-gray-500 mt-2">{label}</div>
    </motion.div>
  );
}

/* ───────────────────── Feature Card ───────────────────── */
function FeatureCard({ icon: Icon, title, desc, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay }}
      className="group bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-2xl p-7 hover:border-yellow-400/40 transition-all duration-300 hover:-translate-y-1"
    >
      <div className="w-12 h-12 bg-yellow-400/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-yellow-400/20 transition-colors">
        <Icon size={22} className="text-yellow-400" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}

/* ───────────────────── Step Card ───────────────────── */
function StepCard({ num, icon: Icon, title, desc, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col items-center text-center relative"
    >
      <div className="w-16 h-16 rounded-full bg-yellow-400 text-black font-extrabold text-xl flex items-center justify-center shadow-lg shadow-yellow-400/20 mb-5">
        {num}
      </div>
      <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-4">
        <Icon size={22} className="text-yellow-400" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm max-w-xs leading-relaxed">{desc}</p>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*                     LANDING PAGE                       */
/* ═══════════════════════════════════════════════════════ */

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-black text-white overflow-x-hidden">
      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 w-full z-50 bg-black/70 backdrop-blur-lg border-b border-zinc-800/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 text-black font-bold rounded-xl flex items-center justify-center shadow-lg">
              P
            </div>
            <span className="text-xl font-bold tracking-wide">ParkIQ</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-gray-300 hover:text-yellow-400 transition font-medium px-4 py-2"
            >
              Sign In
            </button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/register')}
              className="bg-yellow-400 text-black font-bold text-sm px-5 py-2.5 rounded-lg shadow-lg hover:opacity-90 transition"
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24">
        {/* Glow orbs */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-yellow-400/8 rounded-full blur-[120px]" />
        <div className="absolute -bottom-60 -right-40 w-[400px] h-[400px] bg-yellow-400/6 rounded-full blur-[100px]" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="relative z-10 max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-1.5 text-xs text-gray-400 mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Smart Campus Parking System
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight mb-6">
            Campus Parking,
            <span className="block text-yellow-400 mt-2">Reimagined.</span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Book, monitor, and manage every parking slot on campus — in real
            time. Built for students, staff, and administrators.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/register')}
              className="bg-yellow-400 text-black font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-yellow-400/20 hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              Get Started Free <ArrowRight size={18} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/login')}
              className="border border-zinc-700 text-white font-semibold px-8 py-3.5 rounded-xl hover:border-yellow-400/50 hover:bg-zinc-900 transition"
            >
              Sign In →
            </motion.button>
          </div>
        </motion.div>

        {/* Hero stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="relative z-10 flex gap-12 mt-20"
        >
          {[
            { value: '500+', label: 'Parking Slots' },
            { value: '3', label: 'Role Types' },
            { value: '24/7', label: 'Monitoring' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{s.value}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 z-10"
        >
          <ChevronDown size={28} className="text-gray-600" />
        </motion.div>
      </section>

      {/* ── FEATURES ── */}
      <section className="relative py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-xs uppercase tracking-widest text-yellow-400 font-semibold">Features</span>
            <h2 className="text-4xl md:text-5xl font-extrabold mt-3">Everything You Need</h2>
            <p className="text-gray-400 mt-4 max-w-lg mx-auto">
              A complete parking management suite designed for the modern campus.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={MapPin}
              title="Real-Time Availability"
              desc="See which slots are open, booked, or under maintenance — live on the dashboard."
              delay={0}
            />
            <FeatureCard
              icon={CalendarCheck}
              title="Smart Booking"
              desc="Reserve your spot in seconds with automatic 15-minute hold and expiry management."
              delay={0.1}
            />
            <FeatureCard
              icon={Shield}
              title="Role-Based Access"
              desc="Dedicated dashboards for Users, Staff, and Admins with tailored permissions."
              delay={0.2}
            />
            <FeatureCard
              icon={CreditCard}
              title="Automated Billing"
              desc="Hourly billing calculated automatically on checkout with one-click payment."
              delay={0.3}
            />
            <FeatureCard
              icon={Bell}
              title="Instant Alerts"
              desc="Get notified when your booking expires, a slot frees up, or your bill is ready."
              delay={0.4}
            />
            <FeatureCard
              icon={BarChart3}
              title="Campus Analytics"
              desc="Revenue reports, occupancy trends, and usage stats for admins at a glance."
              delay={0.5}
            />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="relative py-28 px-6 bg-zinc-950">
        {/* Subtle glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-yellow-400/5 rounded-full blur-[120px]" />

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-xs uppercase tracking-widest text-yellow-400 font-semibold">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-extrabold mt-3">Three Simple Steps</h2>
            <p className="text-gray-400 mt-4 max-w-lg mx-auto">
              From registration to parking — it takes less than a minute.
            </p>
          </motion.div>

          {/* Connector line */}
          <div className="hidden lg:block absolute top-[210px] left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <StepCard
              num="1"
              icon={UserPlus}
              title="Register & Verify"
              desc="Create your account with email and vehicle number. Secure JWT authentication keeps you safe."
              delay={0}
            />
            <StepCard
              num="2"
              icon={Search}
              title="Find & Book a Slot"
              desc="Browse available slots by floor, type, or section. Book instantly with a single click."
              delay={0.15}
            />
            <StepCard
              num="3"
              icon={Car}
              title="Park & Auto-Bill"
              desc="Staff checks you in. When you leave, billing is computed automatically. Pay online."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* ── STATS SECTION ── */}
      <section className="py-28 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
          <AnimatedStat value="500+" label="Parking Slots" />
          <AnimatedStat value="3" label="User Roles" />
          <AnimatedStat value="24/7" label="Monitoring" />
          <AnimatedStat value="₹1/hr" label="Starting Rate" />
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border border-zinc-800 p-12 md:p-16 text-center"
        >
          {/* CTA glow */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-yellow-400/10 rounded-full blur-[80px]" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-yellow-400/8 rounded-full blur-[80px]" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              Ready to Park <span className="text-yellow-400">Smarter</span>?
            </h2>
            <p className="text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
              Join the campus parking revolution. Register now and never circle the lot again.
            </p>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/register')}
              className="bg-yellow-400 text-black font-bold px-10 py-3.5 rounded-xl shadow-lg shadow-yellow-400/20 hover:opacity-90 transition text-lg"
            >
              Create Free Account
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-zinc-800 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-400 text-black font-bold rounded-lg flex items-center justify-center text-sm">
              P
            </div>
            <span className="font-bold text-sm">ParkIQ</span>
          </div>
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} ParkIQ — Smart Campus Parking. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
