import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';

export function successResponse<T>(
  data: T,
  meta: Partial<ApiResponse['meta']> = {},
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      error: null,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        ...meta,
      },
    },
    { status }
  );
}

export function errorResponse(
  code: string,
  message: string,
  status: number = 400,
  details?: Array<{ field?: string; message: string }> | null
): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    {
      success: false,
      data: null,
      error: {
        code,
        message,
        details: details || null,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    },
    { status }
  );
}
