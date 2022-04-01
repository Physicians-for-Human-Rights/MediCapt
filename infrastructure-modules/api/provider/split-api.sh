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
            cat $i > $PREFIX/$API_PATH/api-part.yaml
        done
    else
        if [ "$FOOTER" == "$i" ]; then
        for API_PATH in $ENDPOINTS; do
            API_PATH=${API_PATH//\//@}
            API_PATH=${API_PATH:1}
            cat $i >> $PREFIX/$API_PATH/api-part.yaml
        done
        else
            API_PATH=$(grep -oP '^  /provider(\K\/.*)(?=:$)' $i)
            API_PATH=${API_PATH//\//@}
            API_PATH=${API_PATH:1}

            cat $i >> $PREFIX/$API_PATH/api-part.yaml
            for method in $(grep -oP '^    (\K(get|put|delete|post))(?=:$)' $PREFIX/$API_PATH/api-part.yaml); do
                mkdir -p $PREFIX/$API_PATH/$method/src
                # NB This api-part.yaml includes the other methods for this endpoint,
                # but this is only for our convenience and is never read in by
                # anything else.
                if [ ! -f $PREFIX/$API_PATH/$method/src/index.ts ]; then
                    cp placeholders/index.ts $PREFIX/$API_PATH/$method/src/index.ts
                    echo $API_PATH/$method
                fi
                if [ ! -f $PREFIX/$API_PATH/$method/policy.json ]; then
                    cp placeholders/policy.json $PREFIX/$API_PATH/$method/policy.json
                fi
                if [ ! -f $PREFIX/$API_PATH/$method/assume-policy.json ]; then
                    cp placeholders/assume-policy.json $PREFIX/$API_PATH/$method/assume-policy.json
                fi
            done
        fi
    fi
done

rm $PREFIX/xx*
