import { Construct } from 'constructs';
import { LoadBalancerConstruct } from './constructs/load-balancer-construct';
import { Stack, StackProps } from 'aws-cdk-lib';
import { EcsClusterConstruct } from './constructs/ecs-cluster-construct';
import { VpcConstruct } from './constructs/vpc-construct';


export class InfraStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    // build the base VPC
    const vpcConstruct = new VpcConstruct(this, 'VpcConstruct');

    // create a new Application Load Balancer
    new LoadBalancerConstruct(
      this,
      'LoadBalancerConstruct',
      {
        vpc: vpcConstruct.vpc
      }
    );

    // Build the ECS Cluster to hold the services
    new EcsClusterConstruct(this, 'EcsClusterConstruct', {
      vpc: vpcConstruct.vpc,
    });
  }
}
