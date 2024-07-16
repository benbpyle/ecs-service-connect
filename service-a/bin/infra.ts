#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ServiceAApiStack } from '../lib/service-a-api-stack';

const app = new cdk.App();
new ServiceAApiStack(app, 'ServiceAApiStack-Latency', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  service: {
    serviceName: 'Service-A',
    ecrUri: 'public.ecr.aws/f8u4w2p3/rust-service-a',
    imageTag: 'latency',
    apiShortName: 'service-a'
  },
});
