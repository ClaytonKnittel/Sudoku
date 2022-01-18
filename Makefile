
PUBLIC_DIR=${CURDIR}/public
SRC=${CURDIR}/src

INDEX=$(PUBLIC_DIR)/index.html
JS_MAIN=$(PUBLIC_DIR)/main.js
STYLE=$(PUBLIC_DIR)/style.css

JS_MAIN_CONF=${CURDIR}/webpack.config.js

_JS_SRC=$(shell find $(SRC) -type f -name '*.js')
_JSX_SRC=$(shell find $(SRC) -type f -name '*.jsx')
_MJS_SRC=$(shell find $(SRC) -type f -name '*.jsx')
JS_SRC=$(_JS_SRC) $(_JSX_SRC) $(_MJS_SRC)

.PHONY: all
all: $(PUBLIC_DIR) $(INDEX) $(JS_MAIN) $(STYLE)

$(PUBLIC_DIR):
	mkdir $(PUBLIC_DIR)

$(INDEX): | $(PUBLIC_DIR)
	cp $(SRC)/index.html $(INDEX)

$(STYLE): | $(PUBLIC_DIR)
	cp $(SRC)/style.css $(STYLE)

$(JS_MAIN): $(JS_SRC) $(JS_MAIN_CONF) | $(PUBLIC_DIR)
	npx webpack --mode production -c $(JS_MAIN_CONF)

.PHONY: clean
clean:
	rm -r $(PUBLIC_DIR)
