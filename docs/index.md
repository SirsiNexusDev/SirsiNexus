---
layout: home
title: Home
---

<div class="hero-section">
  <div class="hero-content">
    <h1 class="hero-title">SirsiNexus</h1>
    <p class="hero-subtitle">AI-Enhanced Cloud Infrastructure Platform</p>
    <p class="hero-description">
      Transform your cloud operations with real AI integration, multi-cloud support, 
      and production-ready infrastructure management.
    </p>
    <div class="hero-buttons">
      <a href="{{ '/getting-started' | relative_url }}" class="btn btn-primary">Get Started</a>
      <a href="{{ '/demos' | relative_url }}" class="btn btn-secondary">View Demos</a>
      <a href="https://github.com/SirsiNexusDev/SirsiNexus" class="btn btn-outline">View on GitHub</a>
    </div>
  </div>
</div>

## 🚀 Key Features

<div class="features-grid">
  <div class="feature-card">
    <h3>🤖 Real AI Integration</h3>
    <p>Advanced AI models with OpenAI GPT-4 and Anthropic Claude for intelligent automation and decision-making.</p>
  </div>
  
  <div class="feature-card">
    <h3>🏗️ Polyglot Architecture</h3>
    <p>Rust core engine, TypeScript frontend, Python analytics platform working seamlessly together.</p>
  </div>
  
  <div class="feature-card">
    <h3>🔐 Enterprise Security</h3>
    <p>JWT authentication, 2FA, RBAC, audit logging, and comprehensive security monitoring.</p>
  </div>
  
  <div class="feature-card">
    <h3>☁️ Multi-Cloud Support</h3>
    <p>Native integration with AWS, Azure, GCP, and DigitalOcean for maximum flexibility.</p>
  </div>
  
  <div class="feature-card">
    <h3>📊 Advanced Analytics</h3>
    <p>TensorFlow and PyTorch-powered analytics with real-time monitoring and predictions.</p>
  </div>
  
  <div class="feature-card">
    <h3>🚢 Production Ready</h3>
    <p>Kubernetes orchestration, Docker containers, and comprehensive CI/CD pipelines.</p>
  </div>
</div>

## 📈 Quick Stats

<div class="stats-section">
  <div class="stat-item">
    <span class="stat-number">180K+</span>
    <span class="stat-label">Lines of Code</span>
  </div>
  <div class="stat-item">
    <span class="stat-number">4</span>
    <span class="stat-label">Programming Languages</span>
  </div>
  <div class="stat-item">
    <span class="stat-number">100%</span>
    <span class="stat-label">Test Coverage</span>
  </div>
  <div class="stat-item">
    <span class="stat-number">24/7</span>
    <span class="stat-label">Monitoring</span>
  </div>
</div>

## 🎯 Use Cases

- **Cloud Migration**: Automated migration with AI-powered optimization
- **Infrastructure Management**: Intelligent resource allocation and scaling
- **Cost Optimization**: ML-driven cost prediction and reduction
- **Security Monitoring**: Real-time threat detection and response
- **DevOps Automation**: Streamlined CI/CD with intelligent workflows

## 🏢 Trusted By

SirsiNexus is designed for organizations that demand:
- **Scalability**: Handle enterprise-level workloads
- **Reliability**: 99.9% uptime with robust failover
- **Security**: Enterprise-grade security and compliance
- **Innovation**: Cutting-edge AI and ML capabilities

<div class="cta-section">
  <h2>Ready to Get Started?</h2>
  <p>Join the next generation of cloud infrastructure management</p>
  <div class="cta-buttons">
    <a href="{{ '/getting-started' | relative_url }}" class="btn btn-primary btn-large">Start Your Journey</a>
    <a href="{{ '/contact' | relative_url }}" class="btn btn-secondary btn-large">Contact Sales</a>
  </div>
</div>

<style>
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4rem 2rem;
  text-align: center;
  margin: -2rem -2rem 3rem -2rem;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  opacity: 0.9;
}

.hero-description {
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto 2rem auto;
  line-height: 1.6;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-block;
}

.btn-primary {
  background: #fff;
  color: #667eea;
}

.btn-secondary {
  background: rgba(255,255,255,0.2);
  color: white;
  border: 2px solid rgba(255,255,255,0.3);
}

.btn-outline {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
}

.feature-card {
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 0.5rem;
  border-left: 4px solid #667eea;
}

.feature-card h3 {
  margin-bottom: 1rem;
  color: #333;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
  text-align: center;
}

.stat-item {
  padding: 1.5rem;
}

.stat-number {
  display: block;
  font-size: 2.5rem;
  font-weight: 700;
  color: #667eea;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.5rem;
}

.cta-section {
  background: #f8f9fa;
  padding: 3rem 2rem;
  text-align: center;
  border-radius: 0.5rem;
  margin: 3rem 0;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 2rem;
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .hero-buttons,
  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
}
</style>
