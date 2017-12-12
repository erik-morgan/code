#!/bin/bash


# ask () {
#     regx="^[YyNn]"
#     local target="$1"
#     until [[ ans =~ $regx ]]; do
#         read -r -p "Delete everthing in $target (y/n)? " ans
#     done
#     if [[ $ans = [Yy] ]]; then
#         cd "$target"
#         rm -rf ..?* .[!.]* *
#     else
#         exit 1
#     fi
# }

ask () {
    target="$1"
    echo "Delete everything in ${target}?"
    select ans in 'Yes' 'No'
    do
        case "$ans" in
            Yes|1)
                cd "$target"
                rm -rf ..?* .[!.]* *
                exit 0
                ;;
            No|2)
                exit 1
                ;;
        esac
    done
}

if [[ $# -eq 0 ]]; then
    ask "$PWD"
elif [[ $# -eq 1 ]]; then
    if [[ -e "$1" && -d "$1" ]]; then
        ask "$1"
    else
        echo "$1 is not a valid target. Must be an existing directory"
        exit 1
    fi
else
    echo "You can only include one target directory. Check for whitespace."
    exit 1
fi