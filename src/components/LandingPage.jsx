import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Home, Percent, PoundSterling, TrendingUp, Info, ArrowRight, LineChart, Target, Coins, ChevronDown } from 'lucide-react';
import '../animations.css';
import { initAnimations } from '../animations';


export default function LandingPage() {
    const navigate = useNavigate();
    const [openFaq, setOpenFaq] = React.useState(null);

    React.useEffect(() => {
        const cleanup = initAnimations();
        return cleanup;
    }, []);

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <div className="app-container" style={{ minHeight: '100vh', overflowY: 'auto', padding: '40px 24px', paddingTop: '100px' }}>

            <header className="main-header">
                <div style={{ maxWidth: '900px', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <img src="/logo_dark.webp" alt="BuyBack HTB Logo" width="32" height="32" style={{ height: '32px', width: '32px', borderRadius: '4px', objectFit: 'contain' }} />
                        <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'white' }}>
                            BuyBack <span className="text-gradient">HTB</span>
                        </span>
                    </Link>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span
                        onClick={() => navigate('/blog')}
                        style={{ color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }}
                        onMouseOver={(e) => e.currentTarget.style.color = 'white'}
                        onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                        Blog
                    </span>
                    <button
                        onClick={() => navigate('/calculator')}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--glass-border)',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    >
                        Launch
                    </button>
                </div>
            </header>

            <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '48px' }}>


                <section style={{ textAlign: 'center', marginTop: '20px' }} className="hero-section">
                    <h1 className="text-gradient hero-headline" style={{ fontSize: '3.5rem', marginBottom: '16px', lineHeight: 1.1 }}>
                        Repay your Help to Buy equity loan with data‑driven confidence.
                    </h1>
                    <p className="hero-subheadline" style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '650px', margin: '0 auto', lineHeight: 1.6 }}>
                        See exactly when to remortgage, sell, or buy back your equity loan — including rising Help to Buy interest after year 5.
                    </p>


                    <button
                        onClick={() => navigate('/calculator')}
                        className="cta-button-animated"
                        style={{
                            marginTop: '32px',
                            padding: '16px 32px',
                            fontSize: '1.2rem',
                            borderRadius: '30px',
                            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '12px',
                            boxShadow: '0 8px 24px rgba(79, 172, 254, 0.4)',
                            transition: 'all 0.2s'
                        }}
                    >
                        Calculate my Help to Buy pay‑off date <ArrowRight size={20} />
                    </button>


                </section>

                {/* Features Section */}
                <section style={{ marginBottom: '32px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Why Use BuyBack HTB?</h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                        <div className="glass-panel feature-card reveal-on-scroll" style={{ padding: '32px', borderRadius: '24px', textAlign: 'center', border: '1px solid var(--glass-border)' }}>
                            <div style={{ background: 'rgba(79, 172, 254, 0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                <LineChart size={32} className="text-gradient" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>Estimate Repayment Costs</h3>
                            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                                Estimate how much it will cost to repay or staircase your Help to Buy in future years. See exact wealth distribution up to <span className="stat-counter count-trigger" data-target="30">0</span> years in the future.
                            </p>
                        </div>

                        <div className="glass-panel feature-card reveal-on-scroll" style={{ padding: '32px', borderRadius: '24px', textAlign: 'center', border: '1px solid var(--glass-border)' }}>
                            <div style={{ background: 'rgba(79, 172, 254, 0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                <Target size={32} className="text-gradient" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>Repay vs Remortgage</h3>
                            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                                Compare keeping the equity loan vs remortgaging to pay it off. Discover the "Crossover Point" where borrowing from the bank becomes cheaper than keeping the loan.
                            </p>
                        </div>

                        <div className="glass-panel feature-card reveal-on-scroll" style={{ padding: '32px', borderRadius: '24px', textAlign: 'center', border: '1px solid var(--glass-border)' }}>
                            <div style={{ background: 'rgba(79, 172, 254, 0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                <Coins size={32} className="text-gradient" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>Year 6 Interest Models</h3>
                            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                                See how rising Help to Buy interest from year 6 affects your monthly costs. Model what happens if you sell your home and repay the loan from the sale.
                            </p>
                        </div>
                    </div>



                    <div style={{ marginTop: '48px', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--glass-border)', position: 'relative' }}>
                        <img
                            src="/feature_abstract.webp"
                            alt="Abstract node network"
                            width="800"
                            height="300"
                            style={{ width: '100%', height: '300px', objectFit: 'cover', display: 'block' }}
                        />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10, 15, 30, 0.9) 0%, rgba(10, 15, 30, 0.2) 100%)' }}></div>
                        <div style={{ position: 'absolute', bottom: '32px', left: '32px', right: '32px' }}>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Data-Driven Decisions</h3>
                            <p style={{ color: '#e0e0e0', maxWidth: '600px', margin: 0 }}>Every calculation is deterministic. No black boxes. See exactly how the Help to Buy interest formula and your property value intersect over time.</p>
                        </div>
                    </div>
                </section>

                {/* Guidance Section */}
                <section className="glass-panel" style={{ padding: '32px', borderRadius: '24px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>How to Use the Calculator</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Gather these key figures before you start to get the most accurate projection.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '16px' }}>

                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)', display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ background: 'rgba(79, 172, 254, 0.1)', padding: '10px', borderRadius: '10px' }}>
                                <Home size={24} className="text-gradient" />
                            </div>
                            <div>
                                <h3 style={{ marginBottom: '2px', fontSize: '1.05rem' }}>Property Growth</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.4, margin: 0 }}>
                                    Current Property Value and projected annual growth rate.
                                </p>
                            </div>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)', display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ background: 'rgba(79, 172, 254, 0.1)', padding: '10px', borderRadius: '10px' }}>
                                <Percent size={24} className="text-gradient" />
                            </div>
                            <div>
                                <h3 style={{ marginBottom: '2px', fontSize: '1.05rem' }}>True HTB Costs</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.4, margin: 0 }}>
                                    HTB Equity Loan % and initial interest rate (usually 1.75%).
                                </p>
                            </div>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)', display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ background: 'rgba(79, 172, 254, 0.1)', padding: '10px', borderRadius: '10px' }}>
                                <PoundSterling size={24} className="text-gradient" />
                            </div>
                            <div>
                                <h3 style={{ marginBottom: '2px', fontSize: '1.05rem' }}>Mortgage Balance</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.4, margin: 0 }}>
                                    Your current mortgage debt and remaining term in years/months.
                                </p>
                            </div>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)', display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ background: 'rgba(79, 172, 254, 0.1)', padding: '10px', borderRadius: '10px' }}>
                                <TrendingUp size={24} className="text-gradient" />
                            </div>
                            <div>
                                <h3 style={{ marginBottom: '2px', fontSize: '1.05rem' }}>Remortgage Plans</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.4, margin: 0 }}>
                                    When your current rate ends and your expected new rate.
                                </p>
                            </div>
                        </div>

                    </div>

                    <div style={{ marginTop: '24px', padding: '12px 16px', background: 'rgba(79, 172, 254, 0.06)', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'center' }} className="reveal-on-scroll insight-strip">
                        <Info size={20} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                        <p style={{ fontSize: '0.85rem', margin: 0, lineHeight: 1.4, color: '#e0e0e0' }}>
                            <strong>Staircasing Insights:</strong> The tool automatically calculates the "Crossover Point"—when borrowing from the bank becomes cheaper than keeping the HTB loan.
                        </p>
                    </div>
                </section>


                {/* FAQ Section */}
                <section style={{ padding: '24px 0', marginTop: '24px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Frequently Asked Questions</h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                            {
                                q: "How do I repay my Help to Buy equity loan when I remortgage?",
                                a: "When you remortgage to repay Help to Buy, you increase your main mortgage amount to cover the cost of the equity loan (repayment). You will need a RICS valuation and a redemption statement from the scheme administrator. Our calculator models this exact scenario to show how your monthly payments change after pay‑off."
                            },
                            {
                                q: "How much will my Help to Buy interest be after year 5?",
                                a: "For the first 5 years, the equity loan is interest‑free. From year 6, you start paying a monthly interest fee (usually starting at 1.75%) which increases every year by CPI + 2%. This means your interest costs can escalate significantly over time, which is why modeling your repayment early is critical."
                            },
                            {
                                q: "Can I pay off my Help to Buy loan early?",
                                a: "Yes, you can pay off the Help to Buy loan at any time. You can either repay it in full or in 10% blocks (staircasing). Paying off the loan early can save you thousands in future interest fees and ensures you keep 100% of your home's future capital growth."
                            },
                            {
                                q: "What happens to my Help to Buy equity loan when I sell my house?",
                                a: "When you sell a home with an active Help to Buy equity loan, you must repay the government's share (e.g., 20% of the sale price) at the point of completion. Our tool helps you model your expected sale proceeds after the loan is repaid, factoring in property growth."
                            }
                        ].map((item, idx) => (

                            <div
                                key={idx}
                                className={`glass-panel faq-item ${openFaq === idx ? 'open' : ''}`}
                                style={{ padding: '24px', borderRadius: '16px' }}
                                onClick={() => toggleFaq(idx)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{item.q}</h3>
                                    <ChevronDown size={20} className="faq-chevron" style={{ color: 'var(--accent-primary)' }} />
                                </div>
                                <div className="faq-content">
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
                                        {item.a}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>


                {/* Footer */}
                <footer className="animated-footer-bg" style={{ marginTop: '48px', padding: '64px 24px', borderRadius: '32px 32px 0 0', display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                <img src="/logo_dark.webp" alt="Logo" width="28" height="28" style={{ height: '28px', width: '28px', borderRadius: '4px', objectFit: 'contain' }} />
                                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>BuyBack <span className="text-gradient">HTB</span></span>
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                                The smart way to model your Help to Buy equity loan repayment and staircasing strategy.
                            </p>
                        </div>

                        <div>
                            <h4 style={{ color: 'white', marginBottom: '16px', fontSize: '1rem' }}>Support</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <a href="mailto:feedback@buybackhtb.com" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    feedback@buybackhtb.com
                                </a>
                                <a href="https://ko-fi.com/buybackhtb" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
                                    Buy me a coffee
                                </a>
                            </div>
                        </div>

                        <div>
                            <h4 style={{ color: 'white', marginBottom: '16px', fontSize: '1rem' }}>Navigation</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem', background: 'none', border: 'none', padding: 0, textAlign: 'left', fontFamily: 'inherit' }}>Home</button>
                                <button onClick={() => navigate('/calculator')} style={{ color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem', background: 'none', border: 'none', padding: 0, textAlign: 'left', fontFamily: 'inherit' }}>Calculator</button>
                                <button onClick={() => navigate('/blog')} style={{ color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem', background: 'none', border: 'none', padding: 0, textAlign: 'left', fontFamily: 'inherit' }}>Blog</button>
                            </div>
                        </div>
                    </div>

                    <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.6, marginBottom: '24px' }}>
                            <strong>Disclaimer:</strong> BuyBack HTB is a mathematical simulation tool provided for illustrative purposes only.
                            It does not constitute financial, legal, or mortgage advice. Accuracy of projections depends on user inputs and market assumptions
                            which may change. Always consult with a qualified financial advisor, RICS valuer, or mortgage broker before making significant property decisions.
                            Information on official government schemes should be verified at GOV.UK.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>
                                © {new Date().getFullYear()} BuyBack HTB. All rights reserved.
                            </span>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}

