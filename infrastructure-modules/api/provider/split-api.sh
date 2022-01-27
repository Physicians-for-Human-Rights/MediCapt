#!/bin/bash

PREFIX=apis
ROOT=provider
ENDPOINTS=$(grep -oP '^  /provider(\K\/.*)(?=:$)' api.yaml)

mkdir -p $PREFIX
csplit -f $PREFIX/xx api.yaml '/^\(  \/.*:\)\|\(definitions:\)$/' '{*}' > /dev/null

HEADER=`ls apis/xx*|sort|head -n1`
FOOTER=`ls apis/xx*|sort|tail -n1`
echo "New APIs created:"
for i in `ls apis/xx*`; do
    if [ "$HEADER" == "$i" ]; then
        for API_PATH in $ENDPOINTS; do
            API_PATH=${API_PATH//\//@}
            API_PATH=${API_PATH:1}
            mkdir -p $PREFIX/$API_PATH
            cat $i > $PREFIX/$API_PATH/api.yaml
        done
    else
        if [ "$FOOTER" == "$i" ]; then
        for API_PATH in $ENDPOINTS; do
            API_PATH=${API_PATH//\//@}
            API_PATH=${API_PATH:1}
            cat $i >> $PREFIX/$API_PATH/api.yaml
        done
        else
            API_PATH=$(grep -oP '^  /provider(\K\/.*)(?=:$)' $i)
            API_PATH=${API_PATH//\//@}
            API_PATH=${API_PATH:1}
            cat $i >> $PREFIX/$API_PATH/api.yaml
            mkdir -p $PREFIX/$API_PATH/src
            if [ ! -f $PREFIX/$API_PATH/src/index.js ]; then
                cp placeholder_src/index.js $PREFIX/$API_PATH/src/index.js
                echo $API_PATH
            fi
        fi
    fi
done

rm $PREFIX/xx*
