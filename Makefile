build-getPaymentLinkFunction:
	bun install
	bun build --target=node --outdir=$(ARTIFACTS_DIR)/src src/getPaymentLink.ts
	cp package.json $(ARTIFACTS_DIR)/
