import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'meta', title: 'Meta & SEO' },
    { name: 'affiliate', title: 'Affiliate Links' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required().min(10).max(100),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'meta',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      group: 'meta',
      options: {
        list: [
          { title: 'Training', value: 'training' },
          { title: 'Health', value: 'health' },
          { title: 'Food', value: 'food' },
          { title: 'Product Reviews', value: 'product-reviews' },
          { title: 'Tips & Guides', value: 'tips-and-guides' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'categoryName',
      title: 'Category Display Name',
      type: 'string',
      group: 'meta',
      description: 'The display name for the category (e.g. "Tips & Guides")',
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      group: 'meta',
      to: [{ type: 'author' }],
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      group: 'content',
      options: { hotspot: true },
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
      group: 'meta',
      rows: 3,
      description: 'Short summary for post cards and meta description. Keep under 160 characters.',
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published Date',
      type: 'datetime',
      group: 'meta',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'featured',
      title: 'Featured Post',
      type: 'boolean',
      group: 'meta',
      description: 'Toggle on to highlight this post on the homepage.',
      initialValue: false,
    }),
    defineField({
      name: 'body',
      title: 'Body Content',
      type: 'array',
      group: 'content',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'H4', value: 'h4' },
            { title: 'Quote', value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
              { title: 'Underline', value: 'underline' },
            ],
            annotations: [
              {
                title: 'URL',
                name: 'link',
                type: 'object',
                fields: [
                  {
                    title: 'URL',
                    name: 'href',
                    type: 'url',
                    validation: (Rule: any) =>
                      Rule.uri({ allowRelative: true, scheme: ['https', 'http', 'mailto'] }),
                  },
                ],
              },
            ],
          },
        },
        {
          type: 'image',
          title: 'Inline Image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', type: 'string', title: 'Alt Text' },
            { name: 'caption', type: 'string', title: 'Caption' },
          ],
        },
        {
          name: 'bodyImage',
          title: 'Sized Image',
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', type: 'string', title: 'Alt Text' },
            { name: 'caption', type: 'string', title: 'Caption' },
            {
              name: 'size',
              type: 'string',
              title: 'Display Size',
              description: 'How the image should be displayed in the article',
              options: {
                list: [
                  { title: 'Standard (content width)', value: 'standard' },
                  { title: 'Wide (breaks out of column)', value: 'wide' },
                  { title: 'Full Width (edge to edge)', value: 'full' },
                  { title: 'Small (centered, 60% width)', value: 'small' },
                  { title: 'Float Left (text wraps right)', value: 'float-left' },
                  { title: 'Float Right (text wraps left)', value: 'float-right' },
                ],
              },
              initialValue: 'standard',
            },
          ],
        },
        {
          name: 'dataTable',
          title: 'Table',
          type: 'object',
          icon: () => '📋',
          fields: [
            {
              name: 'title',
              title: 'Table Title',
              type: 'string',
              description: 'Optional heading above the table',
            },
            {
              name: 'headers',
              title: 'Column Headers',
              type: 'array',
              of: [{ type: 'string' }],
              description: 'Add column names (e.g. "Brand", "Price", "Rating")',
              validation: (Rule: any) => Rule.required().min(2),
            },
            {
              name: 'rows',
              title: 'Rows',
              type: 'array',
              of: [
                {
                  type: 'object',
                  name: 'tableRow',
                  title: 'Row',
                  fields: [
                    {
                      name: 'cells',
                      title: 'Cells',
                      type: 'array',
                      of: [{ type: 'string' }],
                      description: 'Add cell values for each column',
                    },
                  ],
                  preview: {
                    select: { cells: 'cells' },
                    prepare(selection: any) {
                      const cells = selection.cells || []
                      return { title: cells.join(' | ') || 'Empty row' }
                    },
                  },
                },
              ],
            },
            {
              name: 'highlightFirst',
              title: 'Highlight first column',
              type: 'boolean',
              description: 'Make the first cell in each row bold (useful for row labels)',
              initialValue: false,
            },
          ],
          preview: {
            select: { title: 'title', headers: 'headers' },
            prepare(selection: any) {
              return {
                title: selection.title || 'Data Table',
                subtitle: (selection.headers || []).join(', '),
              }
            },
          },
        },
        {
          name: 'chart',
          title: 'Chart / Graph',
          type: 'object',
          icon: () => '📊',
          fields: [
            {
              name: 'title',
              title: 'Chart Title',
              type: 'string',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'chartType',
              title: 'Chart Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Horizontal Bar Chart', value: 'bar' },
                  { title: 'Progress Bars', value: 'progress' },
                  { title: 'Comparison (vs)', value: 'comparison' },
                ],
              },
              initialValue: 'bar',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'items',
              title: 'Data Items',
              type: 'array',
              of: [
                {
                  type: 'object',
                  name: 'chartItem',
                  title: 'Item',
                  fields: [
                    { name: 'label', type: 'string', title: 'Label' },
                    {
                      name: 'value',
                      type: 'number',
                      title: 'Value',
                      description: 'Numeric value (0-100 for progress bars)',
                    },
                    {
                      name: 'suffix',
                      type: 'string',
                      title: 'Suffix',
                      description: 'Unit shown after value (e.g. "%", "mg", "/10")',
                    },
                  ],
                  preview: {
                    select: { label: 'label', value: 'value', suffix: 'suffix' },
                    prepare(selection: any) {
                      return {
                        title: selection.label,
                        subtitle: `${selection.value}${selection.suffix || ''}`,
                      }
                    },
                  },
                },
              ],
              validation: (Rule: any) => Rule.required().min(2),
            },
            {
              name: 'caption',
              title: 'Caption',
              type: 'string',
              description: 'Source or description below the chart',
            },
          ],
          preview: {
            select: { title: 'title', chartType: 'chartType' },
            prepare(selection: any) {
              const typeLabels: Record<string, string> = {
                bar: '📊 Bar Chart',
                progress: '📈 Progress Bars',
                comparison: '⚖️ Comparison',
              }
              return {
                title: selection.title || 'Chart',
                subtitle: typeLabels[selection.chartType] || 'Chart',
              }
            },
          },
        },
      ],
    }),

    // ===== AFFILIATE LINKS (Optional) =====
    defineField({
      name: 'affiliateLinks',
      title: 'Affiliate Product Links',
      type: 'array',
      group: 'affiliate',
      description:
        'Optional. Add product recommendations with affiliate links. These will be displayed as premium product cards within the article.',
      of: [
        {
          type: 'object',
          name: 'affiliateProduct',
          title: 'Product',
          fields: [
            {
              name: 'productName',
              title: 'Product Name',
              type: 'string',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'productUrl',
              title: 'Affiliate URL',
              type: 'url',
              description: 'Your affiliate tracking link',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'productImage',
              title: 'Product Image',
              type: 'image',
              options: { hotspot: true },
            },
            {
              name: 'price',
              title: 'Price',
              type: 'string',
              description: 'e.g. "$29.99" or "From $19.99"',
            },
            {
              name: 'originalPrice',
              title: 'Original Price (for showing discount)',
              type: 'string',
              description: 'e.g. "$49.99" — will show as crossed out',
            },
            {
              name: 'rating',
              title: 'Rating (1-5)',
              type: 'number',
              validation: (Rule: any) => Rule.min(1).max(5),
            },
            {
              name: 'badge',
              title: 'Badge',
              type: 'string',
              description: 'Optional highlight label',
              options: {
                list: [
                  { title: 'Our Top Pick', value: 'Our Top Pick' },
                  { title: 'Best Value', value: 'Best Value' },
                  { title: 'Editor\'s Choice', value: 'Editor\'s Choice' },
                  { title: 'Premium Pick', value: 'Premium Pick' },
                  { title: 'Budget Friendly', value: 'Budget Friendly' },
                  { title: 'Most Popular', value: 'Most Popular' },
                ],
              },
            },
            {
              name: 'description',
              title: 'Short Description',
              type: 'text',
              rows: 2,
              description: 'A brief reason why you recommend this product',
            },
            {
              name: 'buttonText',
              title: 'Button Text',
              type: 'string',
              initialValue: 'Check Price',
              description: 'Text for the CTA button (default: "Check Price")',
            },
            {
              name: 'store',
              title: 'Store Name',
              type: 'string',
              description: 'e.g. "Amazon", "Chewy", "PetSmart"',
            },
          ],
          preview: {
            select: {
              title: 'productName',
              subtitle: 'price',
              media: 'productImage',
              badge: 'badge',
            },
            prepare(selection: any) {
              const { title, subtitle, badge } = selection
              return {
                ...selection,
                title: badge ? `[${badge}] ${title}` : title,
                subtitle: subtitle || 'No price set',
              }
            },
          },
        },
        {
          name: 'dataTable',
          title: 'Table',
          type: 'object',
          fields: [
            {
              name: 'title',
              title: 'Table Title',
              type: 'string',
              description: 'Optional heading above the table',
            },
            {
              name: 'headers',
              title: 'Column Headers',
              type: 'array',
              of: [{ type: 'string' }],
              description: 'Add column names (e.g. "Brand", "Price", "Rating")',
              validation: (Rule: any) => Rule.required().min(2),
            },
            {
              name: 'rows',
              title: 'Rows',
              type: 'array',
              of: [
                {
                  type: 'object',
                  name: 'tableRow',
                  title: 'Row',
                  fields: [
                    {
                      name: 'cells',
                      title: 'Cells',
                      type: 'array',
                      of: [{ type: 'string' }],
                      description: 'Add cell values for each column',
                    },
                  ],
                  preview: {
                    select: { cells: 'cells' },
                    prepare(selection: any) {
                      const cells = selection.cells || []
                      return { title: cells.join(' | ') || 'Empty row' }
                    },
                  },
                },
              ],
            },
            {
              name: 'highlightFirst',
              title: 'Highlight first column',
              type: 'boolean',
              description: 'Make the first cell in each row bold (useful for row labels)',
              initialValue: false,
            },
          ],
          preview: {
            select: { title: 'title', headers: 'headers' },
            prepare(selection: any) {
              return {
                title: selection.title || 'Data Table',
                subtitle: (selection.headers || []).join(', '),
              }
            },
          },
        },
        {
          name: 'chart',
          title: 'Chart / Graph',
          type: 'object',
          fields: [
            {
              name: 'title',
              title: 'Chart Title',
              type: 'string',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'chartType',
              title: 'Chart Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Horizontal Bar Chart', value: 'bar' },
                  { title: 'Progress Bars', value: 'progress' },
                  { title: 'Comparison (vs)', value: 'comparison' },
                ],
              },
              initialValue: 'bar',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'items',
              title: 'Data Items',
              type: 'array',
              of: [
                {
                  type: 'object',
                  name: 'chartItem',
                  title: 'Item',
                  fields: [
                    { name: 'label', type: 'string', title: 'Label' },
                    {
                      name: 'value',
                      type: 'number',
                      title: 'Value',
                      description: 'Numeric value (0-100 for progress bars)',
                    },
                    {
                      name: 'suffix',
                      type: 'string',
                      title: 'Suffix',
                      description: 'Unit shown after value (e.g. "%", "mg", "/10")',
                    },
                  ],
                  preview: {
                    select: { label: 'label', value: 'value', suffix: 'suffix' },
                    prepare(selection: any) {
                      return {
                        title: selection.label,
                        subtitle: `${selection.value}${selection.suffix || ''}`,
                      }
                    },
                  },
                },
              ],
              validation: (Rule: any) => Rule.required().min(2),
            },
            {
              name: 'caption',
              title: 'Caption',
              type: 'string',
              description: 'Source or description below the chart',
            },
          ],
          preview: {
            select: { title: 'title', chartType: 'chartType' },
            prepare(selection: any) {
              const typeLabels: Record<string, string> = { bar: '📊 Bar Chart', progress: '📈 Progress Bars', comparison: '⚖️ Comparison' }
              return {
                title: selection.title || 'Chart',
                subtitle: typeLabels[selection.chartType] || 'Chart',
              }
            },
          },
        },
      ],
    }),

    // ===== AFFILIATE DISPLAY SETTINGS =====
    defineField({
      name: 'affiliatePosition',
      title: 'Affiliate Box Position',
      type: 'string',
      group: 'affiliate',
      description: 'Where to show affiliate products in the article',
      options: {
        list: [
          { title: 'After the article content', value: 'after-content' },
          { title: 'Before the article content', value: 'before-content' },
          { title: 'After the first section', value: 'after-first-section' },
        ],
      },
      initialValue: 'after-content',
    }),
    defineField({
      name: 'affiliateDisclosure',
      title: 'Custom Disclosure Text',
      type: 'text',
      group: 'affiliate',
      rows: 2,
      description:
        'Leave blank to use default: "This article contains affiliate links. We may earn a small commission at no extra cost to you."',
    }),
  ],
  orderings: [
    {
      title: 'Publish Date (Newest)',
      name: 'publishDateDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'featuredImage',
      date: 'publishedAt',
    },
    prepare(selection) {
      const { author, date } = selection
      const d = date ? new Date(date).toLocaleDateString() : 'No date'
      return { ...selection, subtitle: `${author ? `by ${author}` : 'No author'} | ${d}` }
    },
  },
})
