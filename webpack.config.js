module.exports = {
    context: __dirname + "/public/javascripts",
    entry: "./index.jsx",
    output: {
        path: __dirname + "/public/javascripts",
        filename: "bundle.js"
    },
    watch: true,
    module: {
        loaders: [
            {   test: /\.css$/, 
                loader: "style!css" 
            },
            {   test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/, 
                loader: 'file-loader'
            },
            {   test: /.jsx?$/,
                loader: 'babel-loader', 
                exclude: /node-modules/, 
                query: {
                    presets: ['es2015', 'react']
                }
            }
        ]
    }
};