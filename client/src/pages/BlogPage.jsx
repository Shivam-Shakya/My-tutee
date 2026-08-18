import React from "react";
import { Link } from "react-router-dom";
import { BLOG_POSTS } from "./blogData";
import "./BlogPage.css";

const BlogPage = () => {
  return (
    <div className="blog-page">
      <section className="blog-header">
        <div className="blog-header-inner">
          <h1>MyTutee Blog</h1>
          <p>Simple ideas to help students learn smarter every day.</p>
        </div>
      </section>

      <section className="blog-cards-section">
        <div className="blog-grid">
          {BLOG_POSTS.map((post) => (
            <article key={post.id} className="blog-card">
              <Link to={`/blog/${post.id}`} className="blog-card-link" aria-label={`Open ${post.title}`}>
                <img src={post.image} alt={post.title} className="blog-card-image" />
              </Link>
              <div className="blog-card-content">
                <h2>{post.title}</h2>
                <p>{post.excerpt}</p>
                <Link to={`/blog/${post.id}`} className="blog-card-button">
                  Read More
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default BlogPage;
