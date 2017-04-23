#!/bin/zsh
aws cloudformation package --template-file ./setup-aws-backend.yaml --s3-bucket dyno-test-lam-sam --output-template-file build/packaged-template.yaml &&
aws cloudformation deploy --template-file ./build/packaged-template.yaml --capabilities CAPABILITY_IAM --stack-name streak-backend &&
aws cloudformation describe-stacks --stack-name streak-backend
