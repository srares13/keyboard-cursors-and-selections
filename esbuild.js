const esbuild = require('esbuild')

esbuild
   .build({
      entryPoints: ['extension.ts'],
      bundle: true,
      platform: 'node', // It ensures that Node-specific globals (like process or Buffer)
      // and modules (like fs or path) are left intact and not polyfilled or shimmed.
      // This is the correct setting for VS Code extensions since
      // they run in a Node.js context within the VS Code application.
      target: ['node16'],
      outfile: 'bundle/extension.js',
      external: ['vscode'],
      format: 'cjs', // Specifies what module syntax should be used for the transpiled code: CommonJS or ES.
      loader: {
         '.md': 'text',
         '.ts': 'ts'
      },
      sourcemap: true
   })
   .catch(() => process.exit(1))
