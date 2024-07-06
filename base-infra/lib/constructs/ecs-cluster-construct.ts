import { Cluster } from 'aws-cdk-lib/aws-ecs';
import { Construct } from 'constructs';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { IVpc, SecurityGroup } from 'aws-cdk-lib/aws-ec2';

export interface EcsClusterConstructProps {
  vpc: IVpc;
}

export class EcsClusterConstruct extends Construct {
  constructor(scope: Construct, id: string, props: EcsClusterConstructProps) {
    super(scope, id);

    const securityGroup = new SecurityGroup(
      scope,
      `EcsSecurityGroup`,
      {
        vpc: props.vpc,
        allowAllOutbound: true,
      }
    );

    let cluster = new Cluster(
      scope,
      `EcsCluster`,
      {
        clusterName: `DemoCluster`,
        vpc: props.vpc
      }
    );

    new StringParameter(scope, `SsmParamClusterName`, {
      parameterName: `/core-infra/demo-cluster-name`,
      stringValue: 'DemoCluster',
    });

    new StringParameter(scope, `SsmParamClusterArn`, {
      parameterName: `/core-infra/demo-cluster-arn`,
      stringValue: cluster.clusterArn,
    });
  }
}
