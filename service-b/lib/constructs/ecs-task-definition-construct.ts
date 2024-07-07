import {
  AppProtocol,
  Compatibility,
  ContainerImage,
  CpuArchitecture,
  LogDrivers,
  NetworkMode,
  OperatingSystemFamily,
  Protocol,
  Secret,
  TaskDefinition,
} from 'aws-cdk-lib/aws-ecs';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { IStringParameter, StringParameter } from 'aws-cdk-lib/aws-ssm';
import { EcsService } from '../types/service';

export interface EcsTaskDefinitionConstructProps {
  service: EcsService;
}

export class EcsTaskDefinitionConstruct extends Construct {
  private readonly _taskDefinition: TaskDefinition;

  public get task(): TaskDefinition {
    return this._taskDefinition;
  }

  /**
   *
   */
  constructor(
    scope: Construct,
    id: string,
    props: EcsTaskDefinitionConstructProps
  ) {
    super(scope, id);

    // uncomment this if you want to use DD tracing
    // const parameter = StringParameter.fromStringParameterName(scope, "DDApiKey", "/core-infra/dd-api-key");

    this._taskDefinition = new TaskDefinition(scope, `${props.service.serviceName}-TaskDefinition`, {
      cpu: '1024',
      memoryMiB: '2048',
      compatibility: Compatibility.FARGATE,
      runtimePlatform: {
        cpuArchitecture: CpuArchitecture.ARM64,
        operatingSystemFamily: OperatingSystemFamily.LINUX,
      },
      networkMode: NetworkMode.AWS_VPC,
      family: `${props.service.serviceName}-task`,
    });

    this._taskDefinition.addToExecutionRolePolicy(
      new PolicyStatement({
        actions: [
          'ecr:GetAuthorizationToken',
          'ecr:BatchCheckLayerAvailability',
          'ecr:GetDownloadUrlForLayer',
          'ecr:BatchGetImage',
          'logs:CreateLogStream',
          'logs:PutLogEvents',
        ],
        resources: ['*'],
        effect: Effect.ALLOW,
      }));

    // uncomment this if you want to use DD tracing
    // this._taskDefinition.addToTaskRolePolicy(
    //   new PolicyStatement({
    //     actions: ["ssm:Get*"],
    //     effect: Effect.ALLOW,
    //     resources: [parameter.parameterArn]
    //   }));

    this.addApiContainer(props.service);

    // uncomment this if you want to use DD tracing
    // this.addDatadogContainer(props.service, parameter);
  }

  /// addApiContainer creates the service api and attaches to the taskdefinition
  addApiContainer = (service: EcsService) => {
    // api container
    const apiContainer = this._taskDefinition.addContainer('rust-api', {
      // Use an image from Amazon ECR
      image: ContainerImage.fromRegistry(
        `${service.ecrUri}:${service.imageTag}`
      ),
      logging: LogDrivers.awsLogs({ streamPrefix: service.serviceName }),
      environment: {
        BIND_ADDRESS: "0.0.0.0:3000",
        // uncomment this if you want to use DD tracing
        // AGENT_ADDRESS: "127.0.0.1",
        // set this to true if you want to use DD tracing
        DD_TRACING_ENABLED: "false",
        RUST_LOG: "info",
        SERVICE_A_URL: "http://service-a:8080",
        SERVICE_C_URL: "http://service-c:8081"
      },
      containerName: service.apiShortName,
      essential: true,
      cpu: 512,
      memoryReservationMiB: 1024,
    });

    apiContainer.addPortMappings({
      containerPort: 3000,
      appProtocol: AppProtocol.http,
      name: 'web',
      protocol: Protocol.TCP,
    });

  }

  /// addDatadogContainer creates the DD container and sets a few environment variables
  addDatadogContainer = (service: EcsService, parameter: IStringParameter) => {

    // datadog container
    const datadogContainer = this._taskDefinition.addContainer(
      'datadog-agent',
      {
        image: ContainerImage.fromRegistry(
          'public.ecr.aws/datadog/agent:latest'
        ),
        logging: LogDrivers.awsLogs({ streamPrefix: 'rust-api' }),
        secrets: {
          DD_API_KEY: Secret.fromSsmParameter(parameter)
        },
        environment: {
          DD_ENV: 'local',
          DD_SERVICE: service.serviceName,
          DD_SITE: "us5.datadoghq.com"
        },
        essential: true,
        cpu: 100,
        memoryLimitMiB: 512,
      }
    );

    datadogContainer.addPortMappings({
      containerPort: 8126,
      appProtocol: AppProtocol.http,
      name: 'datadog',
      protocol: Protocol.TCP,
    });
  }
}
