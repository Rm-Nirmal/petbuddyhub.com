// Sanity CMS Data Connector for Eleventy
// Fetches posts from Sanity and renders Portable Text body to HTML

require('dotenv').config();

function renderPortableText(blocks) {
  if (!blocks || !Array.isArray(blocks)) return '';

  const { toHTML } = require('@portabletext/to-html');

  return toHTML(blocks, {
    components: {
      types: {
        // Standard image blocks
        image: ({ value }) => {
          const alt = value.alt || '';
          const caption = value.caption || '';
          const size = value.size || 'standard';
          const url = (value.asset && value.asset.url) ? value.asset.url : '';

          if (!url) return '';

          let html = `<figure class="article-image article-image--${size}">`;
          html += `<img src="${url}" alt="${alt}" loading="lazy">`;
          if (caption) {
            html += `<figcaption>${caption}</figcaption>`;
          }
          html += `</figure>`;
          return html;
        },
        // Named image blocks (bodyImage)
        bodyImage: ({ value }) => {
          const alt = value.alt || '';
          const caption = value.caption || '';
          const size = value.size || 'standard';
          const url = (value.asset && value.asset.url) ? value.asset.url : '';

          if (!url) return '';

          let html = `<figure class="article-image article-image--${size}">`;
          html += `<img src="${url}" alt="${alt}" loading="lazy">`;
          if (caption) {
            html += `<figcaption>${caption}</figcaption>`;
          }
          html += `</figure>`;
          return html;
        },

        // Data Table blocks
        dataTable: ({ value }) => {
          const headers = value.headers || [];
          const rows = value.rows || [];
          const highlightFirst = value.highlightFirst || false;

          let html = `<div class="article-table">`;
          if (value.title) {
            html += `<div class="article-table__title">${value.title}</div>`;
          }
          html += `<div class="article-table__wrapper"><table>`;

          // Header row
          if (headers.length) {
            html += `<thead><tr>`;
            headers.forEach((h) => { html += `<th>${h}</th>`; });
            html += `</tr></thead>`;
          }

          // Data rows
          if (rows.length) {
            html += `<tbody>`;
            rows.forEach((row) => {
              html += `<tr>`;
              const cells = row.cells || [];
              cells.forEach((cell, i) => {
                if (i === 0 && highlightFirst) {
                  html += `<td class="article-table__label">${cell}</td>`;
                } else {
                  html += `<td>${cell}</td>`;
                }
              });
              html += `</tr>`;
            });
            html += `</tbody>`;
          }

          html += `</table></div></div>`;
          return html;
        },

        // Chart / Graph blocks
        chart: ({ value }) => {
          const items = value.items || [];
          const chartType = value.chartType || 'bar';
          const maxValue = Math.max(...items.map((i) => i.value || 0), 1);

          let html = `<div class="article-chart article-chart--${chartType}">`;
          if (value.title) {
            html += `<div class="article-chart__title">${value.title}</div>`;
          }
          html += `<div class="article-chart__body">`;

          items.forEach((item) => {
            const pct = chartType === 'progress'
              ? Math.min(item.value || 0, 100)
              : Math.round(((item.value || 0) / maxValue) * 100);
            const displayVal = `${item.value || 0}${item.suffix || ''}`;

            html += `<div class="article-chart__item">`;
            html += `<div class="article-chart__label">${item.label || ''}</div>`;
            html += `<div class="article-chart__bar-track">`;
            html += `<div class="article-chart__bar-fill" style="width: ${pct}%"></div>`;
            html += `</div>`;
            html += `<div class="article-chart__value">${displayVal}</div>`;
            html += `</div>`;
          });

          html += `</div>`;
          if (value.caption) {
            html += `<div class="article-chart__caption">${value.caption}</div>`;
          }
          html += `</div>`;
          return html;
        },
      },
      marks: {
        link: ({ children, value }) => {
          const href = value.href || '#';
          const rel = href.startsWith('/') ? '' : ' rel="noopener noreferrer" target="_blank"';
          return `<a href="${href}"${rel}>${children}</a>`;
        },
      },
    },
  });
}

module.exports = async function () {
  const projectId = process.env.SANITY_PROJECT_ID;
  const dataset = process.env.SANITY_DATASET || 'production';
  const apiVersion = process.env.SANITY_API_VERSION || '2024-01-01';

  if (projectId && projectId !== 'your_project_id_here') {
    try {
      const { createClient } = require('@sanity/client');
      const client = createClient({
        projectId,
        dataset,
        useCdn: true,
        apiVersion,
      });

      const query = `*[_type == "post" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
        _id,
        title,
        "slug": slug.current,
        category,
        categoryName,
        publishedAt,
        excerpt,
        featured,
        body[] {
          ...,
          _type == "bodyImage" => {
            ...,
            "asset": asset->{url}
          },
          _type == "image" => {
            ...,
            "asset": asset->{url}
          }
        },
        "featuredImage": featuredImage.asset->url,
        "featuredImageAlt": featuredImage.alt,
        "author": author->name,
        affiliateLinks[] {
          productName,
          productUrl,
          "productImage": productImage.asset->url,
          price,
          originalPrice,
          rating,
          badge,
          description,
          buttonText,
          store
        },
        affiliatePosition,
        affiliateDisclosure
      }`;

      const posts = await client.fetch(query);
      console.log(`Fetched ${posts.length} posts from Sanity CMS`);

      // Render body to HTML and normalize data
      return posts.map((post) => ({
        ...post,
        bodyHtml: renderPortableText(post.body),
        date: post.publishedAt,
        url: `/blog/${post.slug}/`,
      }));
    } catch (err) {
      console.warn('Sanity fetch failed, using local data:', err.message);
    }
  } else {
    console.log('Sanity not configured. Using sample data. See SANITY_GUIDE.md to connect.');
  }

  return [];
};
