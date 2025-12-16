"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      {/* Navigation */}
      <nav id="navbar" className={scrolled ? "scrolled" : ""}>
        <div className="nav-container">
          <div className="logo">DynoFX</div>
          <ul className="nav-links">
            <li><a href="#features" onClick={(e) => handleSmoothScroll(e, "#features")}>Features</a></li>
            <li><a href="#platforms" onClick={(e) => handleSmoothScroll(e, "#platforms")}>Platforms</a></li>
            <li><a href="#education" onClick={(e) => handleSmoothScroll(e, "#education")}>Education</a></li>
            <li><a href="#pricing" onClick={(e) => handleSmoothScroll(e, "#pricing")}>Pricing</a></li>
            <li><Link href="/login" className="btn btn-outline">Login</Link></li>
            <li><Link href="/signup" className="btn btn-primary">Start Trading</Link></li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero fade-in">
        <div className="hero-container">
          <div className="hero-content">
            <div
              style={{
                display: "inline-block",
                background: "rgba(124, 58, 237, 0.1)",
                color: "var(--primary)",
                padding: "0.5rem 1.5rem",
                borderRadius: "50px",
                fontWeight: 600,
                marginBottom: "1rem",
                border: "2px solid var(--primary)",
              }}
            >
              🎓 Risk-Free Trading Simulator + Academy
            </div>
            <h1>
              Master Trading Without <span className="highlight">Risking Real Money</span>
            </h1>
            <p>
              Learn, practice, and perfect your trading skills in a realistic simulation environment. Get expert training, compete with
              others, and track your progress—all without financial risk.
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href="/signup" className="btn btn-primary">
                Start Free Training
              </Link>
              <a href="#courses" className="btn btn-outline" style={{ color: "white", borderColor: "white" }}>
                Explore Courses
              </a>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">$100K</span>
                <span className="stat-label">Virtual Starting Balance</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">500+</span>
                <span className="stat-label">Training Lessons</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">50K+</span>
                <span className="stat-label">Learning Traders</span>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <div className="trading-card">
              <div className="chart-mockup">
                <div className="chart-line"></div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem", color: "white" }}>
                <div>
                  <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>Practice Trade - EUR/USD</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--success)" }}>1.0856 ↑</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>Virtual Portfolio</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--success)" }}>$101,234.50</div>
                </div>
              </div>
              <div
                style={{
                  marginTop: "1rem",
                  padding: "1rem",
                  background: "rgba(124, 58, 237, 0.2)",
                  borderRadius: "10px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "rgba(255,255,255,0.6)",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  ⚠️ Simulation Mode - No Real Money
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <h2 className="section-title">Learn Trading the Safe Way</h2>
        <p className="section-subtitle">
          Practice with virtual money while building real skills through our comprehensive training program
        </p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎮</div>
            <h3>Realistic Simulation</h3>
            <p>
              Trade with $100K virtual money in a real-market environment. Experience authentic trading without any financial risk.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>DynoFX University</h3>
            <p>
              Access 500+ video lessons, interactive courses, and live webinars. Learn from beginner basics to advanced strategies.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Progress Tracking</h3>
            <p>
              Monitor your learning journey with detailed analytics. See your improvement, earn achievements, and level up your skills.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Trading Competitions</h3>
            <p>Compete with other learners in risk-free tournaments. Test your skills, climb leaderboards, and win rewards.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👨‍🏫</div>
            <h3>Expert Mentorship</h3>
            <p>Get guidance from professional traders. Join study groups, ask questions, and learn from the community.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Strategy Testing</h3>
            <p>Develop and test your trading strategies with zero risk. Perfect your approach before considering real trading.</p>
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section className="platforms" id="platforms">
        <h2 className="section-title">Practice Anywhere, Anytime</h2>
        <p className="section-subtitle">Access your virtual trading account and learning materials on any device</p>
        <div className="platforms-grid">
          <div className="platform-card">
            <div className="platform-image">💻</div>
            <div className="platform-content">
              <h3>Web Simulator</h3>
              <p>Practice trading directly from your browser with our realistic simulation platform. No downloads required.</p>
              <ul>
                <li>Real-time market data simulation</li>
                <li>$100K virtual starting balance</li>
                <li>All trading tools included</li>
                <li>Save & track your progress</li>
              </ul>
              <Link href="/login" className="btn btn-primary" style={{ display: "inline-block", marginTop: "1rem" }}>
                Launch Simulator
              </Link>
            </div>
          </div>
          <div className="platform-card">
            <div className="platform-image">📱</div>
            <div className="platform-content">
              <h3>Mobile Learning App</h3>
              <p>Learn on the go with our mobile app. Practice trading and access courses from anywhere.</p>
              <ul>
                <li>Video lessons & tutorials</li>
                <li>Practice trading mode</li>
                <li>Progress tracking</li>
                <li>Offline course downloads</li>
              </ul>
              <Link href="/coming-soon" className="btn btn-primary" style={{ display: "inline-block", marginTop: "1rem" }}>
                Get Mobile App
              </Link>
            </div>
          </div>
          <div className="platform-card">
            <div className="platform-image">🎓</div>
            <div className="platform-content">
              <h3>DynoFX University</h3>
              <p>Complete trading education platform with structured courses from beginner to advanced level.</p>
              <ul>
                <li>500+ video lessons</li>
                <li>Interactive quizzes</li>
                <li>Certificates of completion</li>
                <li>Live webinars & mentorship</li>
              </ul>
              <Link href="/signup" className="btn btn-primary" style={{ display: "inline-block", marginTop: "1rem" }}>
                Browse Courses
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <h2 className="section-title" style={{ color: "white" }}>
          Success Stories from Our Students
        </h2>
        <p className="section-subtitle" style={{ color: "rgba(255,255,255,0.7)" }}>
          See how DynoFX helped aspiring traders master their skills
        </p>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-rating">★★★★★</div>
            <p className="testimonial-text">
              "I went from complete beginner to confident trader in just 3 months. The simulation environment let me practice without
              fear, and the courses are absolutely top-notch!"
            </p>
            <div className="testimonial-author">
              <div className="author-avatar">JD</div>
              <div className="author-info">
                <h4>John Davidson</h4>
                <p>Business Student</p>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-rating">★★★★★</div>
            <p className="testimonial-text">
              "The structured learning path and gamification kept me motivated. I've completed 50+ courses and my virtual portfolio
              has grown 45%. Ready to take it to the next level!"
            </p>
            <div className="testimonial-author">
              <div className="author-avatar">SC</div>
              <div className="author-info">
                <h4>Sarah Chen</h4>
                <p>Software Engineer</p>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-rating">★★★★★</div>
            <p className="testimonial-text">
              "Best trading education platform I've tried. The simulation feels real, the lessons are clear, and I love competing in
              tournaments with other learners. Highly recommend!"
            </p>
            <div className="testimonial-author">
              <div className="author-avatar">MR</div>
              <div className="author-info">
                <h4>Michael Rodriguez</h4>
                <p>Finance Enthusiast</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-container">
          <h2>Ready to Start Your Trading Education?</h2>
          <p>
            Join DynoFX today and get $100,000 virtual money to practice with. Learn risk-free, compete with others, and master
            trading skills at your own pace.
          </p>
          <div
            style={{
              background: "rgba(255,255,255,0.15)",
              padding: "1rem 2rem",
              borderRadius: "10px",
              margin: "1.5rem auto",
              maxWidth: "600px",
              backdropFilter: "blur(10px)",
            }}
          >
            <div style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.5rem" }}>
              ✓ 100% Risk-Free Learning Environment
            </div>
            <div style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.5rem" }}>✓ No Credit Card Required</div>
            <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>✓ Start with $100K Virtual Money</div>
          </div>
          <div className="cta-buttons">
            <Link href="/signup" className="btn btn-white" style={{ fontSize: "1.1rem", padding: "1rem 3rem" }}>
              Create Free Account
            </Link>
            <a
              href="#courses"
              className="btn btn-outline"
              style={{ borderColor: "white", color: "white", fontSize: "1.1rem", padding: "1rem 3rem" }}
            >
              Explore Courses
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-container">
          <div className="footer-section">
            <h3>DynoFX</h3>
            <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.8 }}>
              A safe, risk-free trading simulation and education platform. Learn to trade with virtual money while building real
              skills.
            </p>
            <div
              style={{
                marginTop: "1.5rem",
                padding: "1rem",
                background: "rgba(124, 58, 237, 0.2)",
                borderRadius: "8px",
                borderLeft: "3px solid var(--primary)",
              }}
            >
              <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.8)", margin: 0 }}>
                <strong>⚠️ Educational Platform Notice:</strong> DynoFX is a trading simulation and education platform. All
                trading is done with virtual money for learning purposes only.
              </p>
            </div>
          </div>
          <div className="footer-section">
            <h3>Learn</h3>
            <ul>
              <li><a href="#">Trading Courses</a></li>
              <li><a href="#">Video Tutorials</a></li>
              <li><a href="#">Trading Strategies</a></li>
              <li><a href="#">Market Analysis</a></li>
              <li><a href="#">Webinars</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Practice</h3>
            <ul>
              <li><a href="#">Trading Simulator</a></li>
              <li><a href="#">Competitions</a></li>
              <li><a href="#">Leaderboards</a></li>
              <li><a href="#">Achievements</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Company</h3>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#">Legal</a></li>
              <li><a href="#">Security</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} DynoFX - Trading Simulation & Education Platform. All rights reserved.</p>
          <p style={{ marginTop: "0.5rem", fontSize: "0.85rem" }}>
            Educational Notice: DynoFX provides trading simulation and educational services only. All trades are executed with
            virtual money. This platform does not involve real money trading or financial services.
          </p>
        </div>
      </footer>
    </>
  );
}
