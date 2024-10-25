// import adapter from '@sveltejs/adapter-static';

// /** @type {import('@sveltejs/kit').Config} */
// const config = {
// 	kit: {
// 		adapter: adapter({ fallback: '404.html' }),
// 		paths: {
// 			base: process.argv.includes('dev') ? '' : process.env.BASE_PATH,
// 		},
// 	},
// };

// export default config;

import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({ fallback: '404.html' }),
		paths: {
			base: process.env.BASE_PATH || '',  // Use the BASE_PATH from environment or default to empty
		},
	},
};

export default config;
