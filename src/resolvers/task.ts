import { PrismaClient, Task } from "@prisma/client";
import {
  ObjectType,
  Field,
  Resolver,
  Arg,
  Mutation,
  Query,
  Int,
} from "type-graphql";

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
  async createTask(
    @Arg("title", { nullable: true }) title?: string,
    @Arg("isComplete") isComplete?: boolean
  ): Promise<Task> {
    const task = await this.prisma.task.create({ data: { title,isComplete } });
    return task;
  }

  @Mutation(() => TaskType)
  async updateTask(
    @Arg("id", () => Int) id: number,
    @Arg("title", { nullable: true }) title?: string,
    @Arg("isComplete", { nullable: true }) isComplete?: boolean
  ): Promise<Task | null> {
    const updatedTask = await this.prisma.task.update({
      where: { id },
      data: { title, isComplete },
    });
    return updatedTask;
  }

  @Mutation(() => Boolean)
  async deleteTask(@Arg("id", () => Int) id: number): Promise<boolean> {
    await this.prisma.task.delete({ where: { id } });
    return true;
  }
}
