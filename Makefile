build-getPaymentLinkFunction:
	bun install
	bun build --target=node --outdir=$(ARTIFACTS_DIR)/src src/getPaymentLink.ts
	copy package.json $(ARTIFACTS_DIR)\
