import ExcelJS from 'exceljs';

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_IMPORT_ROWS = 2000;

export interface ExcelValidationResult {
  valid: boolean;
  error?: string;
  isCsv?: boolean;
}

/**
 * Validates spreadsheet file upload against:
 * 1. Size limit (max 5MB)
 * 2. Extension check (.xlsx, .csv)
 * 3. Magic-byte inspection (PK\x03\x04 for .xlsx, valid text encoding for .csv)
 * 4. Rejection of executable binaries (MZ / PE)
 */
export function validateSpreadsheetBuffer(
  buffer: Buffer,
  fileName: string
): ExcelValidationResult {
  // 1. Size limit check
  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds the 5MB security limit (received ${(buffer.length / (1024 * 1024)).toFixed(2)}MB).`,
    };
  }

  if (buffer.length === 0) {
    return { valid: false, error: 'Uploaded file is empty.' };
  }

  const isXlsxExt = fileName.toLowerCase().endsWith('.xlsx');
  const isCsvExt = fileName.toLowerCase().endsWith('.csv');

  if (!isXlsxExt && !isCsvExt) {
    return {
      valid: false,
      error: 'Invalid file extension. Only .xlsx and .csv spreadsheets are accepted.',
    };
  }

  // Check for malicious executable signatures (MZ header)
  if (buffer.length >= 2 && buffer[0] === 0x4d && buffer[1] === 0x5a) {
    return { valid: false, error: 'Executable binary file upload rejected.' };
  }

  // 2. Magic-byte verification for .xlsx (ZIP container)
  if (isXlsxExt) {
    if (buffer.length < 4) {
      return { valid: false, error: 'Corrupted or truncated spreadsheet file.' };
    }

    const isZipMagic =
      buffer[0] === 0x50 &&
      buffer[1] === 0x4b &&
      (buffer[2] === 0x03 || buffer[2] === 0x05 || buffer[2] === 0x07) &&
      (buffer[3] === 0x04 || buffer[3] === 0x06 || buffer[3] === 0x08);

    if (!isZipMagic) {
      return {
        valid: false,
        error: 'Magic byte mismatch: File content is not a valid OpenXML spreadsheet (.xlsx).',
      };
    }

    return { valid: true, isCsv: false };
  }

  // 3. CSV verification: ensure printable text / no null bytes
  if (isCsvExt) {
    const checkLength = Math.min(buffer.length, 1024);
    for (let i = 0; i < checkLength; i++) {
      if (buffer[i] === 0) {
        return {
          valid: false,
          error: 'Binary content detected in CSV file. File must be valid UTF-8 text.',
        };
      }
    }
    return { valid: true, isCsv: true };
  }

  return { valid: false, error: 'Unsupported spreadsheet format.' };
}

/**
 * Parses an Excel or CSV buffer with strict row count limits using exceljs.
 */
export async function parseSpreadsheetRows(
  buffer: Buffer,
  fileName: string,
  maxRows: number = MAX_IMPORT_ROWS
): Promise<{ rows: Record<string, string>[]; totalRows: number }> {
  const validation = validateSpreadsheetBuffer(buffer, fileName);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const workbook = new ExcelJS.Workbook();

  if (validation.isCsv) {
    const { Readable } = await import('stream');
    const stream = Readable.from(buffer);
    await workbook.csv.read(stream);
  } else {
    await workbook.xlsx.load(buffer as any);
  }

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('Spreadsheet contains no worksheets.');
  }

  const totalRowCount = worksheet.rowCount;
  if (totalRowCount > maxRows + 1) {
    throw new Error(
      `Spreadsheet contains ${totalRowCount - 1} data rows, which exceeds the maximum limit of ${maxRows} rows per import.`
    );
  }

  const headers: string[] = [];
  const rows: Record<string, string>[] = [];

  worksheet.eachRow({ includeEmpty: false }, (row: ExcelJS.Row, rowNumber: number) => {
    if (rowNumber === 1) {
      row.eachCell((cell: ExcelJS.Cell, colNumber: number) => {
        headers[colNumber] = String(cell.value || '').trim();
      });
    } else {
      if (rows.length >= maxRows) return;
      const rowData: Record<string, string> = {};
      row.eachCell((cell: ExcelJS.Cell, colNumber: number) => {
        const header = headers[colNumber];
        if (header) {
          let val: any = cell.value;
          if (val instanceof Date) {
            val = val.toISOString().split('T')[0];
          } else if (typeof val === 'object' && val !== null && 'result' in val) {
            val = (val as { result?: unknown }).result;
          } else if (typeof val === 'object' && val !== null && 'text' in val) {
            val = (val as { text?: unknown }).text;
          }
          rowData[header] = String(val ?? '').trim();
        }
      });
      if (Object.values(rowData).some((v) => v !== '')) {
        rows.push(rowData);
      }
    }
  });

  return { rows, totalRows: rows.length };
}

/**
 * Generates an Excel spreadsheet buffer using exceljs.
 */
export async function createExcelWorkbookBuffer(
  sheetName: string,
  columns: { header: string; key: string; width?: number }[],
  dataRows: Record<string, unknown>[]
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'School ERP Platform';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(sheetName);
  worksheet.columns = columns.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width || 20,
  }));

  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE2E8F0' },
  };

  for (const row of dataRows) {
    worksheet.addRow(row);
  }

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
