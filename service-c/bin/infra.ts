#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ServiceCApiStack } from '../lib/service-c-api-stack';

const app = new cdk.App();
new ServiceCApiStack(app, 'ServiceCApiStack-Latency', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  service: {
    serviceName: 'Service-C',
    ecrUri: 'public.ecr.aws/f8u4w2p3/rust-service-c',
    imageTag: 'no-apm',
    apiShortName: 'service-c'
  },
});
