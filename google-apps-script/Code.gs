/**
 * SiteTrack Pro — Google Apps Script Web App Database Bridge (Code.gs)
 *
 * Target Spreadsheet ID (preserved): 1HNmAdZe7POIzIm9mCUPxQJL7p9BoBZEO1hXq6PZNs5M
 *
 * Preserved 8-Worksheet Schema (exact tab names & column orders):
 *   1. Sites             (A:E — 5 cols)  PK: SiteCode (Col A)
 *   2. ProjectTypes      (A:E — 5 cols)  PK: TypeCode (Col A)
 *   3. Projects          (A:L — 12 cols) PK: ProjectID (Col A)
 *   4. SubProjects       (A:J — 10 cols) PK: SubProjectID (Col A)
 *   5. Contractors       (A:G — 7 cols)  PK: ContractorCode (Col A)
 *   6. ContractsTCP      (A:W — 23 cols) PK: ContractID (Col A)
 *   7. ContractPayments  (A:W — 23 cols) PK: PaymentID (Col A)
 *   8. UserAccounts      (A:K — 11 cols) PK: UserID (Col A)
 *
 * Deployment Instructions:
 *   1. Open your Google Sheet -> Extensions -> Apps Script.
 *   2. Paste this entire file into Code.gs and Save.
 *   3. Click Deploy -> New deployment -> Select type: Web app.
 *   4. Execute as: "Me" | Who has access: "Anyone" (development mode; add server-side auth in Phase 2).
 *   5. Copy the Web App URL (https://script.google.com/macros/s/.../exec) into SiteTrack Pro.
 */

var DEFAULT_SPREADSHEET_ID = '1HNmAdZe7POIzIm9mCUPxQJL7p9BoBZEO1hXq6PZNs5M';

var REQUIRED_SHEETS = [
  'Sites',
  'ProjectTypes',
  'Projects',
  'SubProjects',
  'Contractors',
  'ContractsTCP',
  'ContractPayments',
  'UserAccounts',
];

var SHEET_HEADERS = {
  Sites: ['SiteCode', 'SiteName', 'Developer', 'Location', 'CreatedAt'],
  ProjectTypes: ['TypeCode', 'TypeName', 'Description', 'Active', 'CreatedAt'],
  Projects: [
    'ProjectID',
    'MainProjectCode',
    'SiteCode',
    'SiteName',
    'Developer',
    'TypeCode',
    'TypeName',
    'UnitIdentifier',
    'ProjectName',
    'Status',
    'CreatedAt',
    'UpdatedAt',
  ],
  SubProjects: [
    'SubProjectID',
    'ProjectID',
    'MainProjectCode',
    'SubProjectCode',
    'SubProjectName',
    'Status',
    'Progress',
    'TargetDate',
    'Remarks',
    'UpdatedAt',
  ],
  Contractors: [
    'ContractorCode',
    'ContractorName',
    'Specialty',
    'ContactPerson',
    'ContactInfo',
    'Active',
    'CreatedAt',
  ],
  ContractsTCP: [
    'ContractID',
    'SubProjectID',
    'SubProjectCode',
    'SubProjectName',
    'ProjectID',
    'MainProjectCode',
    'TCPType',
    'TCPAmount',
    'ContractorCode',
    'ContractorName',
    'ContractStatus',
    'AwardDate',
    'Remarks',
    'UpdatedAt',
    'DPPercent',
    'ProgressBillingPercent',
    'RetentionPercent',
    'HasWithholdingTax',
    'WithholdingTaxPercent',
    'PaymentTermsNotes',
    'TCPID',
    'ParentContractID',
    'BIRTaxBreakdownJSON',
  ],
  ContractPayments: [
    'PaymentID',
    'ContractID',
    'SubProjectID',
    'SubProjectCode',
    'MainProjectCode',
    'ContractorCode',
    'ContractorName',
    'BillingType',
    'PaymentStatus',
    'RFPNumber',
    'RFPDate',
    'RFPAmount',
    'RFPPayee',
    'RetentionDeducted',
    'RFPRemarks',
    'CVNumber',
    'CVDate',
    'ChequeAmount',
    'WithheldAmount',
    'ReceiptType',
    'ReceiptNumber',
    'ReceiptDate',
    'UpdatedAt',
  ],
  UserAccounts: [
    'UserID',
    'FullName',
    'Email',
    'RoleTitle',
    'Department',
    'Phone',
    'Status',
    'BioNotes',
    'PermissionsJSON',
    'CreatedAt',
    'UpdatedAt',
  ],
};

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function getSpreadsheet(requestedId) {
  var id = (requestedId || '').toString().trim() || DEFAULT_SPREADSHEET_ID;
  try {
    return SpreadsheetApp.openById(id);
  } catch (err) {
    var active = SpreadsheetApp.getActiveSpreadsheet();
    if (active && (!requestedId || active.getId() === id)) {
      return active;
    }
    throw new Error(
      'Unable to open spreadsheet "' +
        id +
        '". Ensure the Apps Script owner has Editor access. Details: ' +
        err.message
    );
  }
}

function normalizeCellValue(val) {
  if (val === null || val === undefined) return '';
  if (val instanceof Date) {
    return Utilities.formatDate(
      val,
      Session.getScriptTimeZone() || 'UTC',
      'yyyy-MM-dd'
    );
  }
  return String(val);
}

function inspectSpreadsheetData(ss) {
  var existingSheets = [];
  var missingSheets = [];
  var tables = {};

  for (var i = 0; i < REQUIRED_SHEETS.length; i++) {
    var name = REQUIRED_SHEETS[i];
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      missingSheets.push(name);
      tables[name] = [];
      continue;
    }
    existingSheets.push(name);
    var lastRow = sheet.getLastRow();
    var lastCol = Math.max(sheet.getLastColumn(), SHEET_HEADERS[name].length);
    if (lastRow === 0) {
      tables[name] = [];
    } else {
      var rawValues = sheet.getRange(1, 1, lastRow, lastCol).getValues();
      var normalized = [];
      for (var r = 0; r < rawValues.length; r++) {
        var rowOut = [];
        for (var c = 0; c < rawValues[r].length; c++) {
          rowOut.push(normalizeCellValue(rawValues[r][c]));
        }
        normalized.push(rowOut);
      }
      tables[name] = normalized;
    }
  }

  return {
    spreadsheetId: ss.getId(),
    title: ss.getName(),
    spreadsheetUrl: ss.getUrl(),
    existingSheets: existingSheets,
    missingSheets: missingSheets,
    lastSyncedAt: new Date().toISOString(),
    tables: tables,
  };
}

function normalizeRowToWidth(sheetName, values) {
  var headers = SHEET_HEADERS[sheetName];
  if (!headers) {
    throw new Error('Unknown worksheet: ' + sheetName);
  }
  if (!Array.isArray(values)) {
    throw new Error('Row values must be an array.');
  }
  var out = [];
  for (var i = 0; i < headers.length; i++) {
    out.push(
      i < values.length && values[i] !== undefined && values[i] !== null
        ? values[i]
        : ''
    );
  }
  return out;
}

function ensureSheetWithHeaders(ss, sheetName) {
  var headers = SHEET_HEADERS[sheetName];
  if (!headers) {
    throw new Error('Unknown worksheet: ' + sheetName);
  }
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  return sheet;
}

function findRowByPrimaryKey(sheet, recordId, fallbackRowNumber) {
  var targetKey = (recordId || '').toString().trim().toUpperCase();
  var lastRow = sheet.getLastRow();
  if (lastRow >= 2 && targetKey) {
    var keyCol = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < keyCol.length; i++) {
      var cellKey = (keyCol[i][0] || '').toString().trim().toUpperCase();
      if (cellKey === targetKey) {
        return i + 2;
      }
    }
  }
  if (
    typeof fallbackRowNumber === 'number' &&
    fallbackRowNumber >= 2 &&
    fallbackRowNumber <= lastRow
  ) {
    var existingKey = (sheet.getRange(fallbackRowNumber, 1).getValue() || '')
      .toString()
      .trim()
      .toUpperCase();
    if (!targetKey || existingKey === targetKey) {
      return fallbackRowNumber;
    }
  }
  return -1;
}

function doGet(e) {
  try {
    var params = (e && e.parameter) || {};
    var action = (params.action || 'inspectAndLoad').toString().trim();
    var spreadsheetId = (params.spreadsheetId || '').toString().trim();
    var ss = getSpreadsheet(spreadsheetId);

    if (action === 'ping') {
      var existing = [];
      for (var i = 0; i < REQUIRED_SHEETS.length; i++) {
        if (ss.getSheetByName(REQUIRED_SHEETS[i])) {
          existing.push(REQUIRED_SHEETS[i]);
        }
      }
      return jsonResponse({
        ok: true,
        action: 'ping',
        data: {
          spreadsheetId: ss.getId(),
          title: ss.getName(),
          spreadsheetUrl: ss.getUrl(),
          existingSheets: existing,
          missingSheets: REQUIRED_SHEETS.filter(function (s) {
            return existing.indexOf(s) === -1;
          }),
          timestamp: new Date().toISOString(),
        },
      });
    }

    if (action === 'inspectAndLoad') {
      return jsonResponse({
        ok: true,
        action: 'inspectAndLoad',
        data: inspectSpreadsheetData(ss),
      });
    }

    return jsonResponse({
      ok: false,
      error: 'Unsupported GET action: ' + action,
    });
  } catch (err) {
    return jsonResponse({
      ok: false,
      error: err && err.message ? err.message : String(err),
    });
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  var lockAcquired = false;

  try {
    lock.waitLock(20000);
    lockAcquired = true;

    var rawBody =
      e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    var payload = JSON.parse(rawBody);
    var action = (payload.action || '').toString().trim();
    var ss = getSpreadsheet(payload.spreadsheetId);

    if (action === 'initializeSchema') {
      var seedData = payload.seedData || null;
      for (var i = 0; i < REQUIRED_SHEETS.length; i++) {
        var tabName = REQUIRED_SHEETS[i];
        var sheet = ensureSheetWithHeaders(ss, tabName);
        if (
          seedData &&
          Array.isArray(seedData[tabName]) &&
          seedData[tabName].length > 0 &&
          sheet.getLastRow() <= 1
        ) {
          var normalizedSeed = seedData[tabName].map(function (row) {
            return normalizeRowToWidth(tabName, row);
          });
          sheet
            .getRange(2, 1, normalizedSeed.length, SHEET_HEADERS[tabName].length)
            .setValues(normalizedSeed);
        }
      }
      return jsonResponse({
        ok: true,
        action: 'initializeSchema',
        data: inspectSpreadsheetData(ss),
      });
    }

    if (action === 'appendRow') {
      var sheetName = (payload.sheetName || '').toString().trim();
      var sheetToAppend = ensureSheetWithHeaders(ss, sheetName);
      var row = normalizeRowToWidth(sheetName, payload.values);
      var primaryKey = (row[0] || '').toString().trim();
      if (!primaryKey) {
        throw new Error(
          'Primary key (Column A) is required to append a row to ' + sheetName
        );
      }
      var dupRow = findRowByPrimaryKey(sheetToAppend, primaryKey, -1);
      if (dupRow !== -1) {
        throw new Error(
          'Duplicate record blocked: "' +
            primaryKey +
            '" already exists in ' +
            sheetName +
            ' (Row ' +
            dupRow +
            ').'
        );
      }
      sheetToAppend.appendRow(row);
      return jsonResponse({
        ok: true,
        action: 'appendRow',
        data: {
          sheetName: sheetName,
          recordId: primaryKey,
          rowNumber: sheetToAppend.getLastRow(),
        },
      });
    }

    if (action === 'appendRows') {
      var operations = Array.isArray(payload.operations)
        ? payload.operations
        : [];
      if (operations.length === 0) {
        throw new Error('appendRows requires at least one operation.');
      }
      // Pre-validate all operations for duplicates before mutating any sheet
      var preparedOps = [];
      for (var opIdx = 0; opIdx < operations.length; opIdx++) {
        var op = operations[opIdx];
        var opSheetName = (op.sheetName || '').toString().trim();
        var opSheet = ensureSheetWithHeaders(ss, opSheetName);
        var opRows = Array.isArray(op.rows) ? op.rows : [];
        var normalizedRows = [];
        var seenKeys = {};

        for (var rIdx = 0; rIdx < opRows.length; rIdx++) {
          var normRow = normalizeRowToWidth(opSheetName, opRows[rIdx]);
          var pk = (normRow[0] || '').toString().trim();
          var pkUpper = pk.toUpperCase();
          if (!pk) {
            throw new Error(
              'Primary key (Column A) is required in batch append for ' +
                opSheetName
            );
          }
          if (seenKeys[pkUpper]) {
            throw new Error(
              'Duplicate primary key "' + pk + '" in batch for ' + opSheetName
            );
          }
          seenKeys[pkUpper] = true;
          if (findRowByPrimaryKey(opSheet, pk, -1) !== -1) {
            throw new Error(
              'Duplicate record blocked: "' +
                pk +
                '" already exists in ' +
                opSheetName +
                '.'
            );
          }
          normalizedRows.push(normRow);
        }

        preparedOps.push({
          sheet: opSheet,
          sheetName: opSheetName,
          rows: normalizedRows,
        });
      }

      for (var wIdx = 0; wIdx < preparedOps.length; wIdx++) {
        var item = preparedOps[wIdx];
        if (item.rows.length > 0) {
          var startRow = item.sheet.getLastRow() + 1;
          item.sheet
            .getRange(
              startRow,
              1,
              item.rows.length,
              SHEET_HEADERS[item.sheetName].length
            )
            .setValues(item.rows);
        }
      }

      return jsonResponse({
        ok: true,
        action: 'appendRows',
        data: { committedOperations: preparedOps.length },
      });
    }

    if (action === 'updateRow') {
      var updSheetName = (payload.sheetName || '').toString().trim();
      var updSheet = ss.getSheetByName(updSheetName);
      if (!updSheet) {
        throw new Error('Worksheet "' + updSheetName + '" does not exist.');
      }
      var updRowValues = normalizeRowToWidth(updSheetName, payload.values);
      var updRecordId = (payload.recordId || updRowValues[0] || '')
        .toString()
        .trim();
      var targetRow = findRowByPrimaryKey(
        updSheet,
        updRecordId,
        payload.rowNumber
      );
      if (targetRow === -1) {
        throw new Error(
          'Record "' +
            updRecordId +
            '" was not found in ' +
            updSheetName +
            '. Please click Sync Sheet to refresh latest rows.'
        );
      }
      updSheet
        .getRange(targetRow, 1, 1, updRowValues.length)
        .setValues([updRowValues]);
      return jsonResponse({
        ok: true,
        action: 'updateRow',
        data: {
          sheetName: updSheetName,
          recordId: updRecordId,
          rowNumber: targetRow,
        },
      });
    }

    if (action === 'deleteRow') {
      var delSheetName = (payload.sheetName || '').toString().trim();
      var delSheet = ss.getSheetByName(delSheetName);
      if (!delSheet) {
        throw new Error('Worksheet "' + delSheetName + '" does not exist.');
      }
      var delRecordId = (payload.recordId || '').toString().trim();
      if (!delRecordId) {
        throw new Error('recordId is required to delete a row.');
      }
      var delRow = findRowByPrimaryKey(
        delSheet,
        delRecordId,
        payload.rowNumber
      );
      if (delRow === -1) {
        throw new Error(
          'Record "' +
            delRecordId +
            '" was not found in ' +
            delSheetName +
            '. It may have already been deleted.'
        );
      }
      delSheet.deleteRow(delRow);
      return jsonResponse({
        ok: true,
        action: 'deleteRow',
        data: {
          sheetName: delSheetName,
          recordId: delRecordId,
          deletedRowNumber: delRow,
        },
      });
    }

    return jsonResponse({
      ok: false,
      error: 'Unsupported POST action: ' + action,
    });
  } catch (err) {
    return jsonResponse({
      ok: false,
      error: err && err.message ? err.message : String(err),
    });
  } finally {
    if (lockAcquired) {
      lock.releaseLock();
    }
  }
}
