interface ContextProxyError {
  contextProxyError: true;
  error: unknown;
}

export class ContextProxy {
  public static async withErrorProxy<Handler extends () => Promise<any>>(
    handler: Handler
  ): Promise<ReturnType<Handler> | ContextProxyError> {
    let handlerResponse: ReturnType<Handler> | ContextProxyError;

    try {
      handlerResponse = await handler();
    } catch (error) {
      handlerResponse = await this.getErrorResponse(error);
    }

    return handlerResponse;
  }

  public static async throwOrReturn(handlerResponse: ContextProxyError | any): Promise<any> {
    if (
      handlerResponse &&
      typeof handlerResponse === "object" &&
      !Array.isArray(handlerResponse) &&
      "contextProxyError" in handlerResponse &&
      handlerResponse.contextProxyError === true
    ) {
      const { error } = handlerResponse;

      if (!error) throw error;

      if (error.hasOwnProperty("name") && typeof error.name === "string" && error.name !== "Response") {
        const ErrorConstructor = this.getErrorConstructor(error.name);
        const errorInstance = new ErrorConstructor(error.message);
        errorInstance.stack = error.stack;
        throw errorInstance;
      }
      throw error;
    }
    return handlerResponse;
  }

  private static async getErrorResponse(error: unknown): Promise<ContextProxyError> {
    if (!error) {
      return {
        contextProxyError: true,
        error: error,
      };
    }

    if (error instanceof Response) {
      let body: object | string;

      try {
        body = await error.json();
      } catch (e) {
        body = await error.text();
      }

      const headers: { [key: string]: string } = {};
      error.headers.forEach((value, key) => (headers[key] = value));

      return {
        contextProxyError: true,
        error: {
          name: "Response",
          body: body,
          bodyUsed: error.bodyUsed,
          headers: headers,
          ok: error.ok,
          redirected: error.redirected,
          status: error.status,
          statusText: error.statusText,
          type: error.type,
          url: error.url,
        },
      };
    } else if (typeof error === "object" && error instanceof Error) {
      error = {
        ...(error as Error),
        name: (error as Error).constructor.name,
        message: (error as Error).message,
        stack: (error as Error).stack,
      };
    }

    return {
      contextProxyError: true,
      error: error,
    };
  }

  private static getErrorConstructor(name: string): ErrorConstructor {
    return (
      {
        Error: Error,
        EvalError: EvalError,
        RangeError: RangeError,
        ReferenceError: ReferenceError,
        SyntaxError: SyntaxError,
        TypeError: TypeError,
        URIError: URIError,
      }[name] || Error
    );
  }
}
