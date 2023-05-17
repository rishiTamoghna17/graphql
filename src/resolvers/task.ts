import { PrismaClient, Task } from "@prisma/client";
import { ObjectType, Field, Resolver, Arg, Mutation, Query, Int } from "type-graphql";

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

  constructor() {
    this.prisma = new PrismaClient();
  }

  @Query(() => [TaskType])
  async tasks(): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany();
    return tasks;
  }

  @Mutation(() => TaskType)
  async createTask(@Arg('title', { nullable: true }) title?: string): Promise<Task> {
    const task = await this.prisma.task.create({ data: { title } });
    return task;
  }
}



