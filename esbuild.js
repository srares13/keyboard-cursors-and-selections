import esbuild from 'esbuild'

esbuild
   .build({
      entryPoints: ['extension.ts'],
      bundle: true,
      platform: 'node', // It ensures that Node-specific globals (like process or Buffer)
      // and modules (like fs or path) are left intact and not polyfilled or shimmed.
      // This is the correct setting for VS Code extensions since
      // they run in a Node.js context within the VS Code application.
      target: ['node14'],
      outfile: 'bundle/extension.js',
      external: ['vscode'],
      format: 'cjs', // It will output the code in the CommonJS module format.
      loader: {
         '.md': 'text',
         '.ts': 'ts'
      },
      sourcemap: true
   })
   .catch(() => process.exit(1))
