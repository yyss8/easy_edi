module.exports = {
	apps : [
		{
			name: "easyedi",
			script: './node_modules/next/dist/bin/next',
			args: "start --port=80",
			watch: true,
			env_production: {
				"NODE_ENV": "production",
			},
			error_file: './logs/pm2.err.log',
			out_file: './logs/pm2.out.log',
		}
	]
}
