---
description: How to create a new blog post
---

# Creating a New Blog Post

When creating a new blog post for the BuyBack HTB platform, follow these steps carefully to maintain the premium editorial design.

1. **Add Post Data:**
   Open `src/content/blogData.js` and add a new object to the `blogPosts` array. Structure your content like this:
   ```javascript
   {
     id: [NEXT_ID],
     title: "Your Post Title",
     slug: "your-post-slug",
     excerpt: "A brief summary of the post.",
     date: "Month DD, YYYY",
     author: "Mortgage Expert",
     image: "/path_to_image.png", // Must be in the public/ folder
     content: `
       <h2>Your Heading</h2>
       <p>Your paragraph text.</p>
       
       <div class="info-box">
         <h4>Key Takeaway</h4>
         <p>Important callout text.</p>
       </div>
     `
   }
   ```

2. **Styling Rules & Layout (CRITICAL):**
   - The project relies on **inline styles and specific custom CSS** defined in `src/index.css`. 
   - **DO NOT** use generic Tailwind CSS utility classes (e.g., `max-w-4xl`, `pt-20`, `flex-col`) as the Tailwind compiler is not processing them for layout in this project.
   - Use semantic HTML tags (`<h2>`, `<h3>`, `<p>`) for your content in `blogData.js`. 
   - The global `.prose-refined` class (already applied in `BlogPost.jsx`) automatically handles the premium typography, line heights, and spacing for the post body.
   - For emphasized callout boxes, use `<div class="info-box">...</div>`.

3. **Images:**
   Generate or obtain a premium, high-quality banner image for the post. Move it to the `public/` directory and reference it absolutely in the `image` field (e.g., `/my_banner.png`).

4. **Verification:**
   Run the dev server (`npm run dev`) and navigate to `/blog/your-post-slug`. Verify that the post layout is beautifully centered, the text is easy to read, and no unstyled HTML layout issues appear.
