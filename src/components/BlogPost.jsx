import React, { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { blogPosts } from '../content/blogData';
import { Calendar, User, ChevronLeft, Share2, Clock, ArrowRight } from 'lucide-react';

const BlogPost = () => {
    const { slug } = useParams();
    const post = blogPosts.find((p) => p.slug === slug);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [slug]);

    if (!post) {
        return <Navigate to="/blog" replace />;
    }

    // Simple reading time estimation (200 words per minute)
    const readingTime = post.content ? Math.ceil(post.content.split(' ').length / 200) : 5;

    return (
        <article style={{ paddingTop: '120px', paddingBottom: '0' }}>
            <header className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
                <Link
                    to="/blog"
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        opacity: 0.7, textDecoration: 'none', color: 'var(--text-main)',
                        marginBottom: '32px', transition: 'opacity 0.2s', fontWeight: 500
                    }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                    onMouseOut={(e) => e.currentTarget.style.opacity = 0.7}
                >
                    <ChevronLeft size={18} /> Back to reading list
                </Link>

                <div style={{ marginBottom: '20px' }}>
                    <span style={{
                        color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 700,
                        letterSpacing: '0.1em', textTransform: 'uppercase',
                        background: 'rgba(59, 130, 246, 0.1)', padding: '6px 16px', borderRadius: '20px'
                    }}>
                        Editorial
                    </span>
                </div>

                <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 1.1, marginBottom: '32px', fontWeight: 800, letterSpacing: '-0.02em' }}>
                    {post.title}
                </h1>

                <div style={{
                    display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '24px',
                    paddingBottom: '32px', borderBottom: '1px solid rgba(255,255,255,0.1)',
                    marginBottom: '48px', color: 'var(--text-muted)', fontSize: '0.95rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '13px' }}>ME</div>
                        <span style={{ color: 'white', fontWeight: 600 }}>{post.author}</span>
                    </div>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={16} /> {post.date}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={16} /> {readingTime} min read</span>

                    <div style={{ marginLeft: 'auto' }}>
                        <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                            <Share2 size={16} /> Share
                        </button>
                    </div>
                </div>
            </header>

            <div className="container" style={{ maxWidth: '1000px', margin: '0 auto 64px auto', padding: '0 24px' }}>
                <div className="glass-panel" style={{ overflow: 'hidden', borderRadius: '24px', padding: '8px' }}>
                    <img src={post.image} alt={post.title} style={{ width: '100%', height: 'auto', borderRadius: '16px', display: 'block' }} />
                </div>
            </div>

            <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
                <div className="prose-refined fade-in-up" dangerouslySetInnerHTML={{ __html: post.content }} />

                <div className="glass-panel" style={{ marginTop: '80px', padding: '40px', borderRadius: '24px', display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'center' }}>
                    <div style={{ width: '90px', height: '90px', flexShrink: 0, borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.8rem', boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)' }}>ME</div>
                    <div style={{ flex: '1 1 300px' }}>
                        <h4 style={{ fontSize: '1.4rem', marginBottom: '12px', fontWeight: 700, color: 'white' }}>Written by {post.author}</h4>
                        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '20px', fontSize: '1.05rem' }}>Mortgage analyst and Help to Buy specialist dedicated to helping homeowners navigate the complex landscape of UK property finance with clear, data-driven insights.</p>
                        <Link to="/calculator" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '1.05rem' }}>
                            View related calculator <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>

            <footer style={{ marginTop: '100px', padding: '100px 24px', textAlign: 'center', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '20px', fontWeight: 800 }}>Ready to run the numbers?</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', lineHeight: 1.6, marginBottom: '48px' }}>
                        Use our data-driven calculator to see exactly how these strategies apply to your specific financial situation.
                    </p>
                    <Link to="/calculator" className="btn btn-primary" style={{ padding: '20px 40px', fontSize: '1.15rem', borderRadius: '40px', display: 'inline-flex', gap: '12px', boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4)' }}>
                        Try the Calculator <ArrowRight size={22} />
                    </Link>
                </div>
            </footer>
        </article>
    );
};

export default BlogPost;
