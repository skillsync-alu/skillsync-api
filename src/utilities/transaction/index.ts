import { TransactionOptions } from "mongodb";
import { ClientSession, Connection } from "mongoose";

export async function inTransaction<T>(
  connection: Connection,
  callback: (session: ClientSession) => Promise<T>,
  options?: TransactionOptions
): Promise<T> {
  const session = await connection.startSession();

  let result: T;

  await session.withTransaction(async session => {
    result = await callback(session);
  }, options);

  await session.endSession();

  return result;
}
