const path = require("path");

module.exports = {
	entry: "./src/index.js",
	output: {
		filename: "bundle.js",
		path: path.resolve(__dirname, "dist"),
	},
	module: {
		rules: [
			{
				test: /\.glsl$/,
				use: [
					'raw-loader'
				]
			}
		]
	},
	mode: "production"
};
