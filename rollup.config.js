import size           from 'rollup-plugin-filesize'
import { terser }     from 'rollup-plugin-terser'
import minifyPrivates from 'ts-transformer-minify-privates'
import ts             from '@wessberg/rollup-plugin-ts'

const $size = size({ showMinifiedSize: false })

const transformers = [
    service => ({
        before: [minifyPrivates(service.program)]
    })
]

const $ts = ts({
    transpiler: 'babel',
})

const $tsmin = ts({
    transpiler: 'babel',
    transformers,
})

const $terser = terser({
    ecma: 2015,
    compress: {
        passes: 2,
        reduce_vars: false,
        keep_fnames: true,
    },
    mangle: {
        properties: {
            regex: /^_private_/
        },
        reserved: ['Box'],
    }
})

export default [
    {
        input: 'src/index.ts',
        plugins: [$ts],
        output: [
            {
                file: 'dist/index.js',
                format: 'cjs',
            },
            {
                file: 'dist/index.esm.js',
                format: 'esm',
            },
            {
                file: 'dist/index.umd.js',
                format: 'umd',
                name: 'Box',
            },
        ]
    },

    {
        input: 'src/index.ts',
        plugins: [$tsmin],
        output: [
            {
                file: 'dist/index.umd.min.js',
                format: 'umd',
                name: 'Box',
                plugins: [$terser, $size],
            },

            // this is just for information: it's not packaged
            {
                file: 'dist/index.esm.min.js',
                format: 'esm',
                plugins: [$terser, $size],
            },
        ]
    },
]
