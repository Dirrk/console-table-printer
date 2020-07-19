import ColoredConsoleLine from '../utils/colored-console-line';
import { TableInternal } from './internal-table';
import { TABLE_STYLE_DETAILS } from '../utils/table-constants';
import {
  Column,
  createHeaderAsRow,
  createRow,
  printTableHorizontalBorders,
  Row,
  textWithPadding,
  cellText,
} from '../utils/table-helpers';

import { preProcessColumns, preProcessRows } from './tablePreProcessors';

function prepareLineAndPrint(
  tableStyle: TABLE_STYLE_DETAILS,
  columns: Column[],
  row: Row,
  isHeader?: boolean
): string {
  const line = new ColoredConsoleLine();
  line.addWithColor('white', tableStyle.vertical);

  columns.forEach((column) => {
    line.addWithColor('white', ' ');
    line.addWithColor(
      (isHeader && 'white_bold') || column.color || row.color, // column color is priotized as row color
      textWithPadding(
        `${cellText(row.text[column.name])}`,
        column.alignment || 'right',
        column.max_ln || 20
      )
    );
    line.addWithColor('white', ` ${tableStyle.vertical}`);
  });

  return line.printConsole();
}

// ║ 1     ║     I would like some red wine please ║ 10.212 ║
function printRow(table: TableInternal, row: Row): string[] {
  const ret: string[] = [];
  ret.push(prepareLineAndPrint(table.tableStyle, table.columns, row));
  return ret;
}

/*
                  The analysis Result
 ╔═══════╦═══════════════════════════════════════╦════════╗
*/
function printTableTitle(table: TableInternal): string[] {
  const ret: string[] = [];

  if (table.title === undefined) {
    return ret;
  }

  const getTableWidth = () => {
    const reducer = (accumulator: number, currentValue: number) =>
      // ║ cell ║, 2 spaces + cellTextSize + one border on the left
      accumulator + currentValue + 2 + 1;
    return table.columns.map((m) => m.max_ln || 20).reduce(reducer, 1);
  };

  const titleWithPadding = textWithPadding(
    table.title as string,
    'center',
    getTableWidth()
  );
  const styledText = new ColoredConsoleLine();
  styledText.addWithColor('white_bold', titleWithPadding);
  //                  The analysis Result
  ret.push(styledText.printConsole());
  return ret;
}

/*
 ╔═══════╦═══════════════════════════════════════╦════════╗
 ║ index ║                                  text ║  value ║
 ╟═══════╬═══════════════════════════════════════╬════════╢
*/
function printTableHeaders(table: TableInternal): string[] {
  const ret: string[] = [];

  // ╔═══════╦═══════════════════════════════════════╦════════╗
  ret.push(
    printTableHorizontalBorders(
      table.tableStyle.headerTop,
      table.columns.map((m) => m.max_ln || 20)
    )
  );

  // ║ index ║                                  text ║  value ║
  const row = createHeaderAsRow(createRow, table.columns);
  ret.push(prepareLineAndPrint(table.tableStyle, table.columns, row, true));

  // ╟═══════╬═══════════════════════════════════════╬════════╢
  ret.push(
    printTableHorizontalBorders(
      table.tableStyle.headerBottom,
      table.columns.map((m) => m.max_ln || 20)
    )
  );

  return ret;
}

function printTableEnding(table: TableInternal): string[] {
  const ret: string[] = [];
  // ╚═══════╩═══════════════════════════════════════╩════════╝
  ret.push(
    printTableHorizontalBorders(
      table.tableStyle.tableBottom,
      table.columns.map((m) => m.max_ln || 20)
    )
  );
  return ret;
}

export function printTableAndGetConsoleOutput(table: TableInternal): string[] {
  preProcessColumns(table); // enable / disable cols, find maxLn of each col/ computed Columns
  preProcessRows(table); // sort and filter

  const ret: string[] = [];
  printTableTitle(table).forEach((row) => ret.push(row));

  printTableHeaders(table).forEach((row) => ret.push(row));

  table.rows.forEach((row) => {
    printRow(table, row).forEach((row_) => ret.push(row_));
  });
  printTableEnding(table).forEach((row) => ret.push(row));
  return ret;
}

export function printTable(table: TableInternal) {
  printTableAndGetConsoleOutput(table);
}

export function printSimpleTableAndGetConsoleOutput(rows: any[]) {
  const table = new TableInternal();
  table.addRows(rows);
  return printTableAndGetConsoleOutput(table);
}

export function printSimpleTable(rows: any[]) {
  printSimpleTableAndGetConsoleOutput(rows);
}
