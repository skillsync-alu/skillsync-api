import { getClientIp } from "@supercharge/request-ip";
import { CountryCode } from "libphonenumber-js";
import { currencyCountries } from "src/shared/constants/shared.constant";
import { Currency } from "src/shared/interfaces/shared.interface";
import { lookup } from "geoip-country";
import { Logger } from "@nestjs/common";
import { stringify } from "../stringify-json";

const logger = new Logger();

export const getCurrency = (context: any): Currency => {
  try {
    if (!context) {
      return Currency.NGN;
    }

    return (
      currencyCountries[lookup(getClientIp(context.req as Request))?.country] ||
      Currency.NGN
    );
  } catch (error) {
    logger.log(stringify({ error }), "Get Currency Error");

    return Currency.NGN;
  }
};

export const getCountryCode = (context: any): CountryCode => {
  try {
    if (!context) {
      return "NG";
    }

    return lookup(getClientIp(context.req as Request))?.country as CountryCode;
  } catch (error) {
    logger.log(stringify({ error }), "Get Country Code Error");

    return "NG";
  }
};
