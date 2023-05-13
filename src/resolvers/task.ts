import {  Query, Resolver } from "type-graphql";
// import { UpdateResult } from "typeorm";
// import { Task } from "../entities/Task";

@Resolver()
export class TaskResolver {
  @Query(() => String)
  hello(): string {
    return "hello world";
  }
}