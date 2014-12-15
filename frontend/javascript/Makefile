all: debug

debug: openlayers
	python vendor/closure-library/closure/bin/build/closurebuilder.py \
	  --root=vendor/closure-library \
	  --root=src \
	  --namespace="cz.mzk.authorities.verif.main" \
	  --output_mode=compiled \
	  --compiler_jar=compiler.jar \
	  --compiler_flags="--compilation_level=ADVANCED" \
	  --compiler_flags="--externs=vendor/externs/openlayers.js" \
	  --compiler_flags="--debug" \
	  --compiler_flags="--warning_level=VERBOSE" \
	  --compiler_flags="--formatting=PRETTY_PRINT" \
	  > ../js/main.js

release: openlayers
	python vendor/closure-library/closure/bin/build/closurebuilder.py \
	  --root=vendor/closure-library \
	  --root=src \
	  --namespace="cz.mzk.authorities.verif.main" \
	  --output_mode=compiled \
	  --compiler_jar=compiler.jar \
	  --compiler_flags="--compilation_level=ADVANCED" \
	  --compiler_flags="--externs=vendor/externs/openlayers.js" \
	  --compiler_flags="--warning_level=VERBOSE" \
	  > ../js/main.js

openlayers:
	cd vendor/openlayers/build;\
	python build.py full ../../../../js/OpenLayers.js
