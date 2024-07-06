import { IVpc, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

export class VpcConstruct extends Construct {
  private _vpc: IVpc;


  public get vpc(): IVpc {
    return this._vpc;
  }

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this._vpc = new Vpc(this, "CustomVpc", {
      subnetConfiguration: [
        {
          name: "custom-vpc-public-subnet",
          subnetType: SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: "custom-vpc-private-subnet",
          subnetType: SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 24,
        },
        {
          name: "custom-vpc-isolated-subnet",
          subnetType: SubnetType.PRIVATE_ISOLATED,
          cidrMask: 24,
        },
      ],
      maxAzs: 2,
      natGateways: 2,
      vpcName: "CustomVpc",
    });

  }
}
