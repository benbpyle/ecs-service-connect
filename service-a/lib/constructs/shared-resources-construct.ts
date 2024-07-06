import { Cluster } from "aws-cdk-lib/aws-ecs";
import { Construct } from "constructs";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { SecurityGroup, Vpc } from "aws-cdk-lib/aws-ec2";
import { SharedResources } from "../types/shared-resources";

export class SharedResourcesConstruct extends Construct {
  private _sr: SharedResources;


  public get sharedResources(): SharedResources {
    return this._sr;
  }


  constructor(scope: Construct, id: string) {
    super(scope, id);

    const clusterName = StringParameter.fromStringParameterName(scope, "ClusterName", "/core-infra/demo-cluster-name");
    const clusterArn = StringParameter.fromStringParameterName(scope, "ClusterArn", "/core-infra/demo-cluster-arn");
    const vpcName = StringParameter.valueFromLookup(scope, "/core-infra/vpc-name");

    let vpc = Vpc.fromLookup(scope, `CustomVpc`, {
      tags: {
        Name: vpcName,
      },
    });

    let ecsCluster = Cluster.fromClusterAttributes(scope, 'EcsCluster', {
      vpc: vpc,
      clusterArn: clusterArn.stringValue,
      clusterName: clusterName.stringValue,
    });


    this._sr = {
      vpc: vpc,
      cluster: ecsCluster,
    }

  }
}
