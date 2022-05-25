#!/bin/bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
echo $SCRIPT_DIR

echo "Regenerating api.json hack (localstack has bugs with yaml api files)"

(cd ${SCRIPT_DIR}/../../medicapt-infrastructure-modules; wget -nc https://repo1.maven.org/maven2/io/swagger/swagger-codegen-cli/2.4.25/swagger-codegen-cli-2.4.25.jar -O swagger-codegen-cli.jar)

find "${SCRIPT_DIR}/../../medicapt-infrastructure-modules" -type f -name "api.yaml" -exec realpath {} \;
find "${SCRIPT_DIR}/../../medicapt-infrastructure-modules" -type f -name "api.yaml" -execdir \
     java -jar "${SCRIPT_DIR}/../../medicapt-infrastructure-modules/swagger-codegen-cli.jar" generate -Dapis -i {} -l swagger &> /dev/null \;
