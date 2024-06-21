// vite.config.js
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: './1.js',
      formats: ['cjs'],
      fileName: 'jsob',
    },
    rollupOptions: {
      plugins: [
        {
          name: 'cdn',
          generateBundle(_, bundle) {
            console.log(bundle);
            bundle['jsob.cjs'].code = bundle['jsob.cjs'].code.replace('"use strict";', '"use strict";var self = global;');
          },
        },
      ],
    },
  },
});
