// import adapter from '@sveltejs/adapter-static';

// /** @type {import('@sveltejs/kit').Config} */
// const config = {
// 	kit: {
// 		adapter: adapter({
// 			fallback: '404.html'
// 		}),
// 		paths: {
// 			base: process.argv.includes('dev') ? '' : process.env.BASE_PATH
// 		}
// 	}
// };

// export default config;


import adapter from '@sveltejs/adapter-static';

const config = {
    kit: {
        adapter: adapter({
            // default options are shown. On some environments, these options are set automatically
            pages: 'build',
            assets: 'build',
        }),
        paths: {
            base: process.env.BASE_PATH || ''
        }
    }
};

export default config;