import React from 'react';
import { Link } from 'react-router-dom';
import { blogPosts } from '../content/blogData';
import { Calendar, User, ArrowRight } from 'lucide-react';

const BlogList = () => {
    return (
        <div className="blog-list-container section-padding">
            <div className="container">
                <header className="blog-header text-center mb-12">
                    <h1 className="h1 mb-4">Mortgage & Help to Buy Insights</h1>
                    <p className="subhead mx-auto" style={{ maxWidth: '600px' }}>
                        Expert advice and detailed guides to help you navigate your home ownership journey.
                    </p>
                </header>

                <div className="blog-grid">
                    {blogPosts.map((post) => (
                        <Link to={`/blog/${post.slug}`} key={post.id} className="blog-card glass-panel">
                            <div className="blog-card-image">
                                <img src={post.image} alt={post.title} loading="lazy" />
                            </div>
                            <div className="blog-card-content p-6">
                                <div className="blog-meta flex items-center gap-4 mb-3 text-sm opacity-70">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={14} /> {post.date}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <User size={14} /> {post.author}
                                    </span>
                                </div>
                                <h2 className="h3 mb-3">{post.title}</h2>
                                <p className="mb-4 opacity-80">{post.excerpt}</p>
                                <span className="read-more-link flex items-center gap-2 font-bold text-accent">
                                    Read Article <ArrowRight size={16} />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <Link to="/" className="btn btn-secondary">
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default BlogList;
