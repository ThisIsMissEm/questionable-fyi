.PHONY: stats
stats:
	@cloc --no-autogen --fullpath --not-match-d='/(app\/node_modules|node_modules|data)' --not-match-f='(pnpm-lock.yaml|app/.*.json)' .

.PHONY: lex-status
lex-status:
	@goat lex status

.PHONY: lex-update
lex-update:
	@goat lex publish -u