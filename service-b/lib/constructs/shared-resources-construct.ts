import { Cluster } from "aws-cdk-lib/aws-ecs";
import { Construct } from "constructs";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { SecurityGroup, Vpc } from "aws-cdk-lib/aws-ec2";
import { SharedResources } from "../types/shared-resources";
import { ApplicationLoadBalancer } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { loadEnvFile } from "process";

export class SharedResourcesConstruct extends Construct {
  private _sr: SharedResources;

  public get sharedResources(): SharedResources {
    return this._sr;
  }


  constructor(scope: Construct, id: string) {
    super(scope, id);


    const clusterName = StringParameter.fromStringParameterName(scope, "ClusterName", "/core-infra/demo-cluster-latency-name");
    const clusterArn = StringParameter.fromStringParameterName(scope, "ClusterArn", "/core-infra/demo-cluster-latency-arn");
    const vpcName = StringParameter.valueFromLookup(scope, "/core-infra/vpc-latency-name");
    const namespace = StringParameter.fromStringParameterName(scope, "Namespace", "/core-infra/demo-cluster-latency-namespace");

    const securityGroupId = StringParameter.valueFromLookup(scope, "/core-infra/alb-latency-security-group-id");
    const albArn = StringParameter.valueFromLookup(scope, "/core-infra/alb-latency-arn");

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

    let securityGroup = SecurityGroup.fromLookupById(scope, 'SecurityGroup', securityGroupId);
    let loadBalancer = ApplicationLoadBalancer.fromLookup(scope, 'LoadBalancer', {
      loadBalancerArn: albArn
    });

    this._sr = {
      vpc: vpc,
      loadBalancer: loadBalancer,
      securityGroup: securityGroup,
      cluster: ecsCluster,
      namespace: namespace.stringValue
    }

  }
}
