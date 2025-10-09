/**
 * Global type declarations
 * Avoids needing @types/node dependency
 */

declare const process:
  | {
      env?: {
        NODE_ENV?: string;
        [key: string]: string | undefined;
      };
      versions?: {
        node?: string;
      };
    }
  | undefined;

declare const TextEncoder: {
  new (): {
    encode(input: string): Uint8Array;
  };
};

declare const performance:
  | {
      now(): number;
    }
  | undefined;
