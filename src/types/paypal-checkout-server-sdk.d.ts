declare module '@paypal/checkout-server-sdk' {
  export namespace core {
    class PayPalHttpClient {
      constructor(environment: any);
      execute(request: any): Promise<any>;
    }

    class SandboxEnvironment {
      constructor(clientId: string, clientSecret: string);
    }

    class LiveEnvironment {
      constructor(clientId: string, clientSecret: string);
    }
  }

  export namespace orders {
    class OrdersCreateRequest {
      constructor(requestId?: string);
      requestBody(body: any): void;
      prefer(preference: string): void;
    }

    class OrdersCaptureRequest {
      constructor(orderId: string);
      requestBody(body: any): void;
    }

    class OrdersGetRequest {
      constructor(orderId: string);
    }
  }

  export namespace payments {
    class CapturesRefundRequest {
      constructor(captureId: string);
      requestBody(body: any): void;
    }
  }
}
