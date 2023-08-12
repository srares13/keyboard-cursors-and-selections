const esbuild = require('esbuild')

esbuild
   .build({
      entryPoints: ['extension.js'],
      bundle: true,
      platform: 'node',
      target: ['node14'],
      outfile: 'bundle/extension.js',
      external: ['vscode'],
      format: 'cjs',
      loader: {
         '.md': 'text'
      },
      sourcemap: true
   })
   .catch(() => process.exit(1))
