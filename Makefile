test:
	@./node_modules/mocha/bin/mocha \
		./test/registration.test.js \
		./test/login.test.js

.PHONY: test
