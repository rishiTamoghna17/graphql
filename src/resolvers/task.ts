import { PrismaClient, Task } from "@prisma/client";
import {
  ObjectType,
  Field,
  Resolver,
  Arg,
  Mutation,
  Query,
  Int,
  Subscription,
  Root,
} from "type-graphql";
import { PubSub } from "graphql-subscriptions";

@ObjectType()
class TaskType {
  @Field(() => Int)
  id!: number;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;

  @Field({ nullable: true })
  title?: string;

  @Field()
  isComplete!: boolean;
}

@Resolver()
export class TaskResolver {
  private prisma: PrismaClient;
  private pubsub: PubSub;
  constructor() {
    this.prisma = new PrismaClient();
    this.pubsub = new PubSub();
  }

  @Query(() => [TaskType])
  async tasks(): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany();
    return tasks;
  }

  @Mutation(() => TaskType)
  async createTask(
    @Arg("title", { nullable: true }) title?: string,
    @Arg("isComplete") isComplete?: boolean,
  ): Promise<Task> {
    const task = await this.prisma.task.create({ data: { title,isComplete } });
    //publish the create task to the subscription
    await this.pubsub.publish("TASK_CREATED",task)
    return task;
  }

  @Mutation(() => TaskType)
  async updateTask(
    @Arg("id", () => Int) id: number,
    @Arg("title", { nullable: true }) title?: string,
    @Arg("isComplete", { nullable: true }) isComplete?: boolean,
  ): Promise<Task | null> {
    const updatedTask = await this.prisma.task.update({
      where: { id },
      data: { title, isComplete },
    });
    //publish the create task to the subscription
    await this.pubsub.publish("TASK_UPDATED",updatedTask)
    return updatedTask;
  }

  @Mutation(() => Boolean)
  async deleteTask(@Arg("id", () => Int) id: number): Promise<boolean> {
    await this.prisma.task.delete({ where: { id } });
     // Publish the ID of the deleted task to the subscription channel
     await this.pubsub.publish("TASK_DELETED", id);
    return true;
  }

  @Subscription(()=>TaskType,{
    topics:"TASK_CREATED"
  })
  taskCreated(@Root() task: Task): Task {
    return task;
  }

  @Subscription(() => TaskType, {
    topics: "TASK_UPDATED",
  })
  taskUpdated(): AsyncIterator<Task> {
    return this.pubsub.asyncIterator("TASK_UPDATED");
  }
  
@Subscription(()=>Int,{
    topics:"TASK_DELETED"
  })
  taskDeleted():AsyncIterator<number>{
    return this.pubsub.asyncIterator("TASK_DELETED")
  }
}
