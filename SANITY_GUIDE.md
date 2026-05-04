# PetBuddyHub | Sanity CMS Setup and Management Guide

A complete, step-by-step guide to connecting Sanity CMS to your PetBuddyHub website, managing content, and deploying updates automatically.

---

## Table of Contents

1. [Overview: How It All Works](#1-overview-how-it-all-works)
2. [Prerequisites](#2-prerequisites)
3. [Create Your Sanity Project](#3-create-your-sanity-project)
4. [Define Content Schemas](#4-define-content-schemas)
5. [Add Your First Content](#5-add-your-first-content)
6. [Connect Sanity to PetBuddyHub](#6-connect-sanity-to-petbuddyhub)
7. [Writing and Managing Blog Posts](#7-writing-and-managing-blog-posts)
8. [Working with Images](#8-working-with-images)
9. [Auto-Deploy with Webhooks](#9-auto-deploy-with-webhooks)
10. [Deploying Your Site](#10-deploying-your-site)
11. [Setting Up Google AdSense](#11-setting-up-google-adsense)
12. [Affiliate Marketing Setup](#12-affiliate-marketing-setup)
13. [Troubleshooting](#13-troubleshooting)
14. [Quick Reference Checklist](#14-quick-reference-checklist)

---

## 1. Overview: How It All Works

Your PetBuddyHub website uses a **headless CMS architecture**. Here is how the pieces fit together:

```
You write content in Sanity Studio (a web dashboard)
        |
        v
Content is stored in Sanity's cloud (Content Lake)
        |
        v
Eleventy fetches content via API at build time
        |
        v
Static HTML pages are generated and deployed
        |
        v
Visitors see a fast, static website
```

**Key benefit:** You never need to edit code to publish new blog posts. Just write in Sanity Studio, publish, and your site rebuilds automatically.

---

## 2. Prerequisites

Before you begin, make sure you have:

- **Node.js** (v18 or later) installed on your computer
- **npm** (comes with Node.js)
- A **Sanity account** (free at [sanity.io](https://www.sanity.io))
- A **text editor** (VS Code recommended)
- Your PetBuddyHub project files (this repository)

To verify Node.js is installed, open your terminal and run:

```bash
node --version
npm --version
```

Both should return version numbers. If not, download Node.js from [nodejs.org](https://nodejs.org).

---

## 3. Create Your Sanity Project

### Step 1: Install the Sanity CLI

Open your terminal and run:

```bash
npm install -g @sanity/cli
```

This installs the Sanity command-line tool globally on your machine.

### Step 2: Create a new project folder

Navigate to a location **outside** your PetBuddyHub folder. The Sanity Studio is a separate project:

```bash
mkdir petbuddyhub-studio
cd petbuddyhub-studio
```

### Step 3: Initialize the Sanity project

```bash
npm create sanity@latest
```

You will be prompted with several questions. Here are the recommended answers:

| Prompt | Answer |
|--------|--------|
| Login method | Google, GitHub, or Email |
| Project name | `petbuddyhub-studio` |
| Use default dataset configuration? | Yes |
| Project output path | Press Enter (use current directory) |
| Select project template | Blog (schema) |
| Do you want to use TypeScript? | No |
| Package manager | npm |

### Step 4: Save your Project ID

After creation, Sanity will display your **Project ID**. It looks something like `abc123xy`.

You can also find it in the file `sanity.config.js` inside your studio folder:

```javascript
// sanity.config.js
export default defineConfig({
  projectId: 'YOUR_PROJECT_ID',  // <-- this is what you need
  dataset: 'production',
  // ...
})
```

**Write this Project ID down.** You will need it in Step 6.

### Step 5: Start Sanity Studio locally

```bash
npm run dev
```

Open your browser and go to `http://localhost:3333`. You should see the Sanity Studio dashboard.

---

## 4. Define Content Schemas

Schemas define the structure of your content. Replace the auto-generated schemas with these custom ones designed for your pet blog.

### Post Schema

Create or replace the file `schemaTypes/post.js`:

```javascript
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().min(10).max(100),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{type: 'category'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{type: 'author'}],
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
          description: 'Describe the image for accessibility and SEO',
        },
      ],
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      description: 'Short description for post cards. Keep under 160 characters.',
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published Date',
      type: 'datetime',
    }),
    defineField({
      name: 'featured',
      title: 'Featured Post',
      type: 'boolean',
      description: 'Toggle on to display this post on the homepage.',
      initialValue: false,
    }),
    defineField({
      name: 'body',
      title: 'Body Content',
      type: 'array',
      of: [
        {type: 'block'},
        {
          type: 'image',
          options: {hotspot: true},
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alt Text',
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
          ],
        },
      ],
    }),
  ],
  orderings: [
    {
      title: 'Publish Date (Newest)',
      name: 'publishDateDesc',
      by: [{field: 'publishedAt', direction: 'desc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'featuredImage',
    },
    prepare(selection) {
      const {author} = selection
      return {...selection, subtitle: author && `by ${author}`}
    },
  },
})
```

### Category Schema

Create the file `schemaTypes/category.js`:

```javascript
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
    }),
  ],
})
```

### Author Schema

Create the file `schemaTypes/author.js`:

```javascript
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Profile Image',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
      rows: 3,
    }),
  ],
  preview: {
    select: {title: 'name', media: 'image'},
  },
})
```

### Register All Schemas

Open `schemaTypes/index.js` and update it:

```javascript
import post from './post'
import category from './category'
import author from './author'

export const schemaTypes = [post, category, author]
```

### Restart Sanity Studio

After updating schemas, stop the running server (Ctrl+C) and restart:

```bash
npm run dev
```

You should now see **Post**, **Category**, and **Author** in the Sanity Studio sidebar.

---

## 5. Add Your First Content

### Step 1: Create Categories

In Sanity Studio, click **Category** in the sidebar, then click the **+** (compose) button. Create these five categories one by one:

| Title | Slug | Description |
|-------|------|-------------|
| Training | `training` | Learn effective techniques to train your pet. |
| Health | `health` | Keep your pet healthy with expert advice. |
| Food | `food` | Nutrition guides and diet tips for every pet. |
| Product Reviews | `product-reviews` | Honest reviews of the best pet products. |
| Tips and Guides | `tips-and-guides` | Practical tips for every stage of pet ownership. |

For each category:
1. Type the **Title**
2. Click **Generate** next to the Slug field
3. Add the **Description**
4. Click **Publish** (green button at the bottom)

### Step 2: Create an Author

Click **Author** in the sidebar, then click **+** (compose):

1. **Name:** Your name or "PetBuddyHub Team"
2. **Image:** Upload a profile photo
3. **Bio:** A short bio about yourself
4. Click **Publish**

### Step 3: Create Your First Blog Post

Click **Post** in the sidebar, then click **+** (compose):

1. **Title:** Enter your post title (e.g., "How to Choose the Right Dog Breed")
2. **Slug:** Click "Generate" to auto-create from the title
3. **Category:** Select from the dropdown (e.g., "Tips and Guides")
4. **Author:** Select the author you just created
5. **Featured Image:** Click to upload an image
6. **Excerpt:** Write a 1-2 sentence summary
7. **Published Date:** Click to set today's date and time
8. **Featured:** Toggle ON if you want it on the homepage
9. **Body:** Write your article using the rich text editor

Click **Publish** when done.

---

## 6. Connect Sanity to PetBuddyHub

### Step 1: Create the environment file

In your PetBuddyHub project root, copy the example file:

```bash
cp .env.example .env
```

Or on Windows:

```powershell
Copy-Item .env.example .env
```

### Step 2: Add your credentials

Open the `.env` file and fill in your values:

```
SANITY_PROJECT_ID=your_project_id_here
SANITY_DATASET=production
SANITY_API_VERSION=2024-01-01
```

Replace `your_project_id_here` with the Project ID you saved in Step 3.4.

### Step 3: Configure API access

By default, Sanity requires authentication for API requests. For a public blog, you need to allow unauthenticated reads:

1. Go to [sanity.io/manage](https://www.sanity.io/manage)
2. Select your project
3. Click **API** in the left sidebar
4. Under **Tokens**, you can create a read token (optional for public datasets)
5. Under **CORS Origins**, add your deployment URL (e.g., `https://petbuddyhub.com`)
6. Make sure your dataset visibility is set to **Public**

### Step 4: Verify the connection

Run the build command:

```bash
npm run build
```

If the connection works, you will see:

```
Fetched X posts from Sanity CMS
```

If Sanity is not configured or credentials are wrong, you will see:

```
Sanity not configured, using sample data. See SANITY_GUIDE.md to connect.
```

This fallback ensures your site always builds, even without Sanity.

### How the data flows

```
Sanity Studio (you write here)
     |
     v
Sanity Content Lake (cloud storage)
     |
     v
src/_data/sanityPosts.js (GROQ query fetches posts)
     |
     v
Eleventy processes templates with this data
     |
     v
Static HTML files are generated in /public
     |
     v
Deployed to your hosting provider
```

---

## 7. Writing and Managing Blog Posts

### The Rich Text Editor

Sanity's editor supports all standard formatting:

| Format | How to Use |
|--------|-----------|
| **Bold** | Select text, click B or Ctrl+B |
| *Italic* | Select text, click I or Ctrl+I |
| Heading 2 | Select text, choose H2 from dropdown |
| Heading 3 | Select text, choose H3 from dropdown |
| Bullet list | Click list icon or type "- " |
| Numbered list | Click numbered list icon or type "1. " |
| Block quote | Click quote icon |
| Link | Select text, click link icon, paste URL |
| Image | Click the + button, select Image |

### SEO Best Practices for Each Post

Follow these guidelines for every post you publish:

1. **Title:** Include your primary keyword. Keep it under 60 characters.
2. **Slug:** Should be short and keyword-rich (e.g., `best-dog-food-2026`)
3. **Excerpt:** Write a compelling 120-160 character summary. This appears in search results.
4. **Featured Image:** Always include one. Use descriptive alt text.
5. **Headings:** Use H2 for main sections, H3 for sub-sections. Never skip levels.
6. **First paragraph:** Include your target keyword naturally.
7. **Word count:** Aim for 1,500+ words for ranking articles.
8. **Internal links:** Link to your other relevant posts within the body.

### Publishing Workflow

| Status | What it Means |
|--------|--------------|
| Draft | Only visible in Sanity Studio. Not on your website. |
| Published | Live on your website after the next build. |
| Unpublished | Removed from your website after the next build. |

To publish: Click the green **Publish** button at the bottom of the editor.

To unpublish: Click the dropdown arrow next to Publish, select **Unpublish**.

---

## 8. Working with Images

### Uploading Images

When you add an image in Sanity Studio:

1. Click the image field
2. Drag and drop, or click to browse
3. After uploading, click **Set hotspot** to choose the focal point
4. Always fill in the **Alt Text** field for accessibility and SEO

### Image Optimization

Sanity automatically optimizes images via their CDN. When you use their image URL builder, you can request specific sizes:

```
https://cdn.sanity.io/images/PROJECT_ID/DATASET/IMAGE_ID-WIDTHxHEIGHT.FORMAT
```

The `sanityPosts.js` file in your project already handles image URL construction.

### Recommended Image Sizes

| Use Case | Recommended Size |
|----------|-----------------|
| Featured image | 1200 x 630 px (ideal for social sharing) |
| In-post images | 800 x 500 px |
| Author avatar | 200 x 200 px |
| Category images | 800 x 600 px |

---

## 9. Auto-Deploy with Webhooks

When you publish or update content in Sanity, you want your website to rebuild automatically. Webhooks make this possible.

### Setting Up on Netlify

1. Log in to [netlify.com](https://www.netlify.com)
2. Go to your site dashboard
3. Navigate to **Site settings** then **Build and deploy**
4. Under **Build hooks**, click **Add build hook**
5. Name it `sanity-publish`
6. Select your production branch (usually `main`)
7. Click **Save**
8. Copy the generated webhook URL

### Setting Up on Vercel

1. Log in to [vercel.com](https://www.vercel.com)
2. Go to your project settings
3. Navigate to **Git** section
4. Under **Deploy Hooks**, click **Create Hook**
5. Name it `sanity-publish`, select your branch
6. Copy the generated URL

### Connect the Webhook to Sanity

1. Go to [sanity.io/manage](https://www.sanity.io/manage)
2. Select your project
3. Click **API** in the sidebar
4. Click **Webhooks**
5. Click **Create Webhook**
6. Fill in the form:

| Field | Value |
|-------|-------|
| Name | `Deploy PetBuddyHub` |
| URL | Paste your Netlify/Vercel webhook URL |
| Dataset | `production` |
| Trigger on | Create, Update, Delete |
| Filter | `_type == "post"` |
| Projection | Leave empty |
| Status | Enable |

7. Click **Save**

Now, every time you publish, update, or delete a post in Sanity Studio, your website will automatically rebuild with the latest content. This usually takes 1-3 minutes.

---

## 10. Deploying Your Site

### Option A: Deploy to Netlify (Recommended)

1. Push your PetBuddyHub code to a GitHub repository
2. Log in to [netlify.com](https://www.netlify.com)
3. Click **Add new site** then **Import an existing project**
4. Connect your GitHub account and select your repository
5. Configure the build settings:

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Publish directory | `public` |
| Node version | 18 (set in Environment variables: `NODE_VERSION = 18`) |

6. Add your environment variables:
   - `SANITY_PROJECT_ID` = your project ID
   - `SANITY_DATASET` = `production`
   - `SANITY_API_VERSION` = `2024-01-01`

7. Click **Deploy site**

### Option B: Deploy to Vercel

1. Push your code to GitHub
2. Log in to [vercel.com](https://www.vercel.com)
3. Click **New Project**, import your repository
4. Framework preset: **Other**
5. Build command: `npm run build`
6. Output directory: `public`
7. Add the same environment variables as above
8. Click **Deploy**

### Custom Domain Setup

After deploying, add your custom domain:

1. In your hosting dashboard, go to **Domain settings**
2. Add `petbuddyhub.com` (or your domain)
3. Update your domain's DNS records to point to your host:
   - For Netlify: Add a CNAME record pointing to your Netlify URL
   - For Vercel: Add a CNAME record pointing to `cname.vercel-dns.com`
4. Enable HTTPS (both Netlify and Vercel do this automatically)

---

## 11. Setting Up Google AdSense

### Step 1: Apply for AdSense

1. Go to [adsense.google.com](https://adsense.google.com)
2. Sign in with your Google account
3. Enter your website URL
4. Select your payment country
5. Accept the terms and submit

**Note:** Google typically requires your site to have 15-20 quality articles and be at least a few weeks old before approval.

### Step 2: Add the AdSense Script

Once approved, you will receive a code snippet. Open `src/_includes/layouts/base.njk` and replace the commented AdSense line in the `<head>`:

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID" crossorigin="anonymous"></script>
```

### Step 3: Replace Ad Placeholders

Your site has `<div class="ad-slot">` placeholders in strategic locations. Replace them with your actual ad units:

```html
<div class="ad-slot">
  <ins class="adsbygoogle"
    style="display:block"
    data-ad-client="ca-pub-YOUR_ID"
    data-ad-slot="YOUR_AD_SLOT_ID"
    data-ad-format="auto"
    data-full-width-responsive="true"></ins>
  <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
</div>
```

### Where Ads Are Placed

| Location | Why It Works |
|----------|-------------|
| Inside blog posts (after 2nd paragraph) | High engagement, readers are invested |
| Sidebar | Always visible while reading |
| Between posts on listing pages | Natural content break |
| After article content | Readers finished and looking for next action |

---

## 12. Affiliate Marketing Setup

### How Affiliate Links Work

1. You join an affiliate program (e.g., Amazon Associates)
2. You get a unique tracking link for products
3. You include these links in your review posts
4. When someone clicks and buys, you earn a commission

### Recommended Affiliate Programs for Pet Blogs

| Program | Commission Rate | Cookie Duration | Best For |
|---------|----------------|-----------------|----------|
| Amazon Associates | 1-10% | 24 hours | All pet products |
| Chewy Affiliates | 4-8% | 15 days | Pet food and supplies |
| Petco Affiliates | 4-8% | 7 days | Pet accessories |
| ShareASale | Varies by brand | 30+ days | Specialty pet brands |

### Adding Affiliate Links in Sanity

When writing a blog post in Sanity Studio:

1. Select the product name text
2. Click the **Link** icon in the toolbar
3. Paste your affiliate URL
4. The link will appear in your published article

### Affiliate Disclosure (Required by Law)

You **must** include a disclosure on every page that contains affiliate links. Add this text at the top of your review posts:

> Disclosure: This article contains affiliate links. If you make a purchase through these links, we may earn a small commission at no additional cost to you. This supports our work and allows us to continue providing free content.

Your site already includes this disclosure in the existing blog post templates.

### High-Converting Content Types

| Content Type | Example Title | Why It Converts |
|-------------|---------------|-----------------|
| Product roundups | "Best Dog Beds of 2026" | Readers are ready to buy |
| Comparison posts | "Dry Food vs Wet Food" | Helps decision-making |
| Problem-solution | "Stop Your Dog from Pulling" | Links to training tools |
| Seasonal guides | "Winter Gear for Your Dog" | Timely and urgent |

---

## 13. Troubleshooting

### "Sanity not configured" message during build

**Cause:** The `.env` file is missing or has incorrect values.

**Fix:**
1. Make sure `.env` exists in your project root (not `.env.example`)
2. Verify `SANITY_PROJECT_ID` matches your actual project ID
3. Check there are no extra spaces or quotes around the values

### Posts not appearing on the website

**Cause:** Posts are still in draft state, or the site hasn't rebuilt.

**Fix:**
1. In Sanity Studio, make sure the post shows **Published** status
2. Make sure the `publishedAt` date is set
3. Run `npm run build` locally to test
4. If using webhooks, check that the webhook is enabled in Sanity settings

### Images not loading from Sanity

**Cause:** Image URL builder not configured, or CORS not set up.

**Fix:**
1. Verify your Sanity project has public dataset access enabled
2. Add your site URL to CORS origins in Sanity project settings
3. Make sure image fields have values (not empty)

### Build fails with an error

**Cause:** Various possible issues.

**Fix:**
1. Check the API version format in `.env` (must be `YYYY-MM-DD`)
2. Run `npm install` to ensure all dependencies are installed
3. Check for syntax errors in your schema files
4. View the full error message in the terminal for specific guidance

### Sanity Studio shows no content types

**Cause:** Schemas are not properly registered.

**Fix:**
1. Verify all schema files exist in the `schemaTypes/` folder
2. Check that `schemaTypes/index.js` imports and exports all schemas
3. Restart the studio with `npm run dev`

---

## 14. Quick Reference Checklist

Use this checklist to track your setup progress:

**Initial Setup**
- [ ] Node.js installed (v18+)
- [ ] Sanity CLI installed globally
- [ ] Sanity project created
- [ ] Project ID saved

**Content Schemas**
- [ ] Post schema created
- [ ] Category schema created
- [ ] Author schema created
- [ ] Schemas registered in index.js
- [ ] Studio restarted and schemas visible

**Content**
- [ ] 5 categories created (Training, Health, Food, Product Reviews, Tips and Guides)
- [ ] Author profile created
- [ ] First blog post written and published

**Connection**
- [ ] `.env` file created with correct Project ID
- [ ] Build tested locally with `npm run build`
- [ ] Posts appearing correctly on local site

**Deployment**
- [ ] Code pushed to GitHub
- [ ] Hosting configured (Netlify or Vercel)
- [ ] Environment variables added to hosting platform
- [ ] Site deployed successfully
- [ ] Custom domain connected (optional)

**Auto-Deploy**
- [ ] Build hook created in hosting platform
- [ ] Webhook created in Sanity project settings
- [ ] Tested: publish a post and verify site rebuilds

**Monetization**
- [ ] Applied for Google AdSense
- [ ] AdSense code added to base template
- [ ] Ad placeholders replaced with live units
- [ ] Joined at least one affiliate program
- [ ] Affiliate disclosure added to review posts

---

## Helpful Links

| Resource | URL |
|----------|-----|
| Sanity Documentation | [sanity.io/docs](https://www.sanity.io/docs) |
| Sanity Project Dashboard | [sanity.io/manage](https://www.sanity.io/manage) |
| Eleventy Documentation | [11ty.dev/docs](https://www.11ty.dev/docs/) |
| Sanity GROQ Reference | [sanity.io/docs/groq](https://www.sanity.io/docs/groq) |
| Google AdSense | [adsense.google.com](https://adsense.google.com) |
| Amazon Associates | [affiliate-program.amazon.com](https://affiliate-program.amazon.com) |
| Netlify | [netlify.com](https://www.netlify.com) |
| Vercel | [vercel.com](https://www.vercel.com) |
