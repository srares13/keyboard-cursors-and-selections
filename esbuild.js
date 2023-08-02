const esbuild = require('esbuild')

esbuild
   .build({
      entryPoints: ['extension.js'],
      bundle: true,
      platform: 'node',
      target: ['node14'],
      outfile: 'bundle/extension.js',
      external: ['vscode'],
      format: 'cjs'
   })
   .catch(() => process.exit(1))
