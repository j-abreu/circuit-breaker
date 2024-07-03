import {StatusCodes} from 'http-status-codes';
import {handleProxyReq, handleProxyRes} from './cuircuitBreaker';
import {buildErrorResponse} from './errorHandling';

function handleProxyError(proxyErr: any, _req: any, res: any) {
  console.log(`[PROXY] Proxy failed with error ${proxyErr.message}`);

  const statusCode = StatusCodes.INTERNAL_SERVER_ERROR;

  return res
    .status(statusCode)
    .json(
      buildErrorResponse(
        statusCode,
        `Proxy failed with error ${proxyErr.message}`
      )
    );
}

function getProxyOptions(route: string, target: string) {
  const proxyOptions = {
    target,
    changeOrigin: true,
    pathRewrite: {
      [`^${route}`]: '',
    },
    on: {
      proxyReq: handleProxyReq,
      proxyRes: handleProxyRes,
      error: handleProxyError,
    },
  };

  return proxyOptions;
}

export default {
  getProxyOptions,
};
