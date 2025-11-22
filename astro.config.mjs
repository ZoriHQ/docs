// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'Zori Docs',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/ZoriHQ/zori' }],
			customCss: [
				'./src/styles/custom.css',
			],
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						{ label: 'Introduction', slug: 'index' },
						{ label: 'Quickstart', slug: 'getting-started/quickstart' },
					],
				},
				{
					label: 'Self-Hosting',
					items: [
						{ label: 'Requirements', slug: 'self-hosting/requirements' },
						{ label: 'Docker Setup', slug: 'self-hosting/docker' },
						{ label: 'Manual Setup', slug: 'self-hosting/manual' },
						{ label: 'Environment Variables', slug: 'self-hosting/environment' },
					],
				},
				{
					label: 'Tracking Script',
					items: [
						{ label: 'Installation', slug: 'tracking/installation' },
						{ label: 'JavaScript API', slug: 'tracking/javascript-api' },
						{ label: 'Automatic Events', slug: 'tracking/automatic-events' },
						{ label: 'GDPR Compliance', slug: 'tracking/gdpr' },
					],
				},
				{
					label: 'Framework SDKs',
					items: [
						{ label: 'React', slug: 'sdks/react' },
						{ label: 'Next.js', slug: 'sdks/nextjs' },
						{ label: 'Svelte', slug: 'sdks/svelte' },
						{ label: 'Vue', slug: 'sdks/vue' },
					],
				},
				{
					label: 'Concepts',
					items: [
						{ label: 'How It Works', slug: 'concepts/how-it-works' },
						{ label: 'Revenue Attribution', slug: 'concepts/revenue-attribution' },
					],
				},
				{
					label: 'Integrations',
					items: [
						{ label: 'Stripe', slug: 'integrations/stripe' },
					],
				},
			],
		}),
	],
});
