.PHONY: stats
stats:
	@cloc --no-autogen --not-match-d='/(app\/node_modules|data)' --not-match-f='pnpm-lock.yaml' .

.PHONY: lex-status
lex-status:
	@goat lex status

.PHONY: lex-update
lex-update:
	@goat lex publish -u