import { WindowTypeEnum } from "./WindowTypeEnum";

export type WindowQueryOptions = {
  populate?: boolean;
  windowTypes?: Array<WindowTypeEnum>;
};
