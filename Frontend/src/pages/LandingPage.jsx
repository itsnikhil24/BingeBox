import { Link } from "react-router-dom";
import { Play, Upload, Zap, Film, Users, ShieldCheck } from "lucide-react";
import "./LandingPage.css";

function LogoMark({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="#120D0F" stroke="#FFC145" strokeWidth="2" />
      <circle cx="32" cy="9" r="2.6" fill="#FFC145" />
      <circle cx="47" cy="14" r="2.6" fill="#FFC145" />
      <circle cx="55" cy="28" r="2.6" fill="#FFC145" />
      <circle cx="55" cy="36" r="2.6" fill="#FFC145" />
      <circle cx="47" cy="50" r="2.6" fill="#FFC145" />
      <circle cx="32" cy="55" r="2.6" fill="#FFC145" />
      <circle cx="17" cy="50" r="2.6" fill="#FFC145" />
      <circle cx="9" cy="36" r="2.6" fill="#FFC145" />
      <circle cx="9" cy="28" r="2.6" fill="#FFC145" />
      <circle cx="17" cy="14" r="2.6" fill="#FFC145" />
      <path d="M25 21 L44 32 L25 43 Z" fill="#FFC145" />
    </svg>
  );
}

const pageDescription =
  "BingeWatch is a fast video streaming platform. Upload in one click, stream adaptive HLS anywhere, and grow an audience around your feed.";

const features = [
  {
    icon: Upload,
    num: "01",
    title: "One-click uploads",
    text: "Drop a file and we handle transcoding, thumbnails and playlists for you.",
  },
  {
    icon: Zap,
    num: "02",
    title: "Adaptive streaming",
    text: "HLS delivery adjusts quality on the fly, so playback never stalls.",
  },
  {
    icon: Film,
    num: "03",
    title: "A feed worth browsing",
    text: "Every upload lands in Now Screening with clean cards and instant playback.",
  },
  {
    icon: Users,
    num: "04",
    title: "Creator profiles",
    text: "Your name, avatar and upload history follow every video you publish.",
  },
  {
    icon: ShieldCheck,
    num: "05",
    title: "Secure accounts",
    text: "Session-based auth keeps uploads locked to the people who own them.",
  },
  {
    icon: Play,
    num: "06",
    title: "Watch anywhere",
    text: "A responsive player that behaves the same on phone, tablet and desktop.",
  },
];

const steps = [
  {
    count: "3",
    title: "Create an account",
    text: "Register with your name, username and email in seconds.",
  },
  {
    count: "2",
    title: "Upload your video",
    text: "Add a title and description, then let the pipeline do the work.",
  },
  {
    count: "1",
    title: "Share the link",
    text: "Your video goes live in the feed with its own watch page.",
  },
];

const stats = [
  ["4K", "Adaptive playback"],
  ["<2s", "Time to first frame"],
  ["∞", "Uploads per creator"],
];

function BulbRow({ count = 26 }) {
  return (
    <div className="bulb-row">
      {Array.from({ length: count }).map((_, i) => (
        <i key={i} className="bulb" style={{ animationDelay: `${i * 0.12}s` }} />
      ))}
    </div>
  );
}

function SprocketStrip({ count = 60 }) {
  return (
    <div className="sprocket-strip">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="sprocket" />
      ))}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="bw-page">
      <header className="site-header">
        <nav className="nav-wrap">
          <Link to="/" className="logo">
            <LogoMark size={28} />
            <span className="logo-text">BINGEWATCH</span>
          </Link>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <Link to="/dashboard">Browse</Link>
          </div>
          <div className="nav-cta">
            <Link to="/login" className="btn btn-ghost">
              Log in
            </Link>
            <Link to="/register" className="btn btn-marquee">
              Get started
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* HERO */}
        <section className="hero">
          <div className="wrap">
            <BulbRow />

            <span className="eyebrow">● Now Screening</span>

            <h1 className="hero-title">
              Your videos deserve a <span className="accent">real screen</span>
            </h1>

            <p className="hero-sub">{pageDescription}</p>

            <div className="hero-cta">
              <Link to="/register" className="btn btn-marquee btn-lg">
                <Play size={16} />
                Start watching free
              </Link>
              <Link to="/dashboard" className="btn btn-ghost btn-lg">
                Explore the feed
              </Link>
            </div>

            <dl className="stats">
              {stats.map(([value, label]) => (
                <div className="stat" key={label}>
                  <dt>{value}</dt>
                  <dd>{label}</dd>
                </div>
              ))}
            </dl>

            <div className="bulb-row-bottom">
              <BulbRow />
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="features">
          <div className="wrap">
            <div className="section-head">
              <span className="kicker">The bill</span>
              <h2>Everything between upload and applause</h2>
              <p>Six things BingeWatch takes care of so you can focus on what's on screen.</p>
            </div>

            <div className="feature-grid">
              {features.map(({ icon: Icon, num, title, text }) => (
                <article className="ticket" key={title}>
                  <span className="ticket-num">FEATURE — {num}</span>
                  <div className="ticket-icon">
                    <Icon size={16} />
                  </div>
                  <h3>{title}</h3>
                  <div className="perf">
                    <p>{text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="how">
          <div className="wrap">
            <div className="section-head">
              <span className="kicker">Roll camera</span>
              <h2>From file to feed in three counts</h2>
              <p>No approval queues, no waiting rooms. Publish and you're live.</p>
            </div>

            <div className="countdown">
              {steps.map((s) => (
                <div className="leader" key={s.count}>
                  <div className="circle">{s.count}</div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta">
          <div className="wrap">
            <h2>
              Ready for your <span className="serif-italic">premiere</span>?
            </h2>
            <p>Create your free account and put your first video on screen today.</p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-red btn-lg">
                Create account
              </Link>
              <Link to="/login" className="btn btn-ghost btn-lg">
                I already have one
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="wrap">
          <SprocketStrip />
          <div className="footer-top">
            <span className="logo">
              <LogoMark size={24} />
              <span className="logo-text">BINGEWATCH</span>
            </span>
            <div className="footer-links">
              <a href="#features">Features</a>
              <a href="#how">How it works</a>
              <Link to="/dashboard">Browse</Link>
              <Link to="/support">Support</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} BingeWatch. All rights reserved.</span>
            <span>Streamed in adaptive HLS, everywhere.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}