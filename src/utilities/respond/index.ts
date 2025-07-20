import { Response } from "express";
import { HttpStatus } from "@nestjs/common";

/**
 * This is a function that returns a response object to the client.
 * @param status The success status as true or false.
 * @param message The message to be sent to the client.
 * @param data The data to be sent to the client.
 */
export function respond(
  res?: Response,
  message = "Successful!",
  status: boolean | number = true,
  data: any = undefined
) {
  let statusCode = status as number;

  if (typeof status === "boolean") {
    if (status) {
      statusCode = HttpStatus.OK;
    } else {
      statusCode = HttpStatus.BAD_REQUEST;
    }
  }

  if (res) {
    return res
      .status(statusCode)
      .send({ message, data, ok: statusCode === HttpStatus.OK });
  }

  return { statusCode, message, data, ok: statusCode === HttpStatus.OK };
}
