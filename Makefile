.PHONY: stats
stats:
	cloc --no-autogen --not-match-d='/(app\/node_modules|data)' --not-match-f='pnpm-lock.yaml' .